"use client";

import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "../../../lib/supabase";

interface GuestData {
  id?: string;
  name: string;
  guestsCount: number;
  isExisting: boolean;
  alreadyCheckedIn?: boolean;
  wishes?: string;
}

export default function ScannerPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [guestData, setGuestData] = useState<GuestData | null>(null);

  // Camera State
  const [facingMode, setFacingMode] = useState<"environment" | "user">("user");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Dynamic nicknames
  const [projectNicknames, setProjectNicknames] = useState("Wedding");

  useEffect(() => {
    const fetchProject = async () => {
      const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2';
      const { data } = await supabase
        .from('projects')
        .select('bride_nickname, groom_nickname')
        .eq('id', projectId)
        .maybeSingle();
      if (data) {
        setProjectNicknames(`${data.bride_nickname || 'Bride'} & ${data.groom_nickname || 'Groom'}`);
      }
    };
    fetchProject();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      const scanner = scannerRef.current;

      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }

        if (isMounted) {
          const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
            if (window.innerWidth >= 768) {
              return { width: 250, height: 250 };
            }
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minEdge * 0.85);
            return { width: size, height: size };
          };

          await scanner.start(
            { facingMode: facingMode },
            { 
              fps: 10, 
              qrbox: qrboxFunction,
            },
            onScanSuccess,
            onScanFailure
          );
        }
      } catch (error) {
        console.error("Error starting scanner:", error);
        if (facingMode === "user" && isMounted) {
          setFacingMode("environment");
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(console.error);
      }
    };
  }, [facingMode]);

  const onScanSuccess = async (decodedText: string) => {
    if (isProcessing) return; // Prevent double scans
    setIsProcessing(true);
    
    try {
      setMessage({ text: `Looking up: ${decodedText}...`, type: "info" });
      
      const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2';
      
      // 1. Search in guests table by name
      const { data: guestMatch, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .eq('project_id', projectId)
        .eq('name', decodedText)
        .maybeSingle();

      if (guestError) throw guestError;

      if (guestMatch) {
        // 2. Check if checkin already exists in public.checkins
        const { data: checkinMatch, error: checkinError } = await supabase
          .from('checkins')
          .select('*')
          .eq('project_id', projectId)
          .eq('guest_id', guestMatch.id)
          .maybeSingle();

        if (checkinError) throw checkinError;

        if (checkinMatch) {
          setGuestData({
            id: guestMatch.id,
            name: guestMatch.name,
            guestsCount: parseInt(checkinMatch.notes || '1', 10),
            isExisting: true,
            alreadyCheckedIn: true
          });
          setShowModal(true);
          setMessage(null);
          return;
        }

        // 3. Find RSVP pax if any
        const { data: rsvpMatch } = await supabase
          .from('rsvp')
          .select('pax')
          .eq('project_id', projectId)
          .eq('guest_id', guestMatch.id)
          .maybeSingle();

        setGuestData({
          id: guestMatch.id,
          name: guestMatch.name,
          guestsCount: rsvpMatch?.pax || 1,
          isExisting: true,
          alreadyCheckedIn: false
        });
      } else {
        // Walk-in Guest (does not exist in db)
        setGuestData({
          name: decodedText,
          guestsCount: 1,
          isExisting: false,
          alreadyCheckedIn: false,
          wishes: ""
        });
      }
      
      setShowModal(true);
      setMessage(null);

    } catch (error) {
      console.error("Error looking up guest:", error);
      setMessage({ text: "Failed to look up guest data.", type: "error" });
      setTimeout(() => {
        setIsProcessing(false);
        setMessage(null);
      }, 3000);
    }
  };

  const onScanFailure = (error: unknown) => {
    // Ignore frequent scan failures
  };

  const handleSave = async () => {
    if (!guestData) return;
    
    try {
      const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2';
      let guestId = guestData.id;

      if (!guestData.isExisting) {
        // 1. Create a guest entry
        const { data: newGuest, error: guestError } = await supabase
          .from('guests')
          .insert({
            project_id: projectId,
            name: guestData.name,
            is_vip: false,
            notes: 'Walk-in registration'
          })
          .select()
          .single();

        if (guestError) throw guestError;
        guestId = newGuest.id;

        // 2. Create RSVP
        const { error: rsvpError } = await supabase
          .from('rsvp')
          .insert({
            project_id: projectId,
            guest_id: guestId,
            guest_name: guestData.name,
            attendance: 'hadir',
            pax: guestData.guestsCount,
            message: guestData.wishes || 'Walk-in registration'
          });

        if (rsvpError) throw rsvpError;

        // 3. Create guestbook entry if wishes entered
        if (guestData.wishes && guestData.wishes.trim() !== "") {
          await supabase
            .from('guestbook_entries')
            .insert({
              project_id: projectId,
              guest_id: guestId,
              name: guestData.name,
              message: guestData.wishes,
              is_approved: true
            });
        }
      } else {
        // Update RSVP attendance
        const { data: rsvpMatch } = await supabase
          .from('rsvp')
          .select('id')
          .eq('project_id', projectId)
          .eq('guest_id', guestId)
          .maybeSingle();

        if (rsvpMatch) {
          await supabase
            .from('rsvp')
            .update({
              attendance: 'hadir',
              pax: guestData.guestsCount
            })
            .eq('id', rsvpMatch.id);
        } else {
          await supabase
            .from('rsvp')
            .insert({
              project_id: projectId,
              guest_id: guestId,
              guest_name: guestData.name,
              attendance: 'hadir',
              pax: guestData.guestsCount,
              message: ''
            });
        }
      }

      // 4. Record Check-in
      const { error: checkinError } = await supabase
        .from('checkins')
        .insert({
          project_id: projectId,
          guest_id: guestId,
          notes: guestData.guestsCount.toString() // Store actual count in notes
        });

      if (checkinError) throw checkinError;
      
      setShowModal(false);
      setMessage({ text: `Welcome, ${guestData.name}!`, type: "success" });
      
    } catch (error) {
      console.error("Error saving checkin:", error);
      setMessage({ text: "Failed to save check-in data.", type: "error" });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setGuestData(null);
        setMessage(null);
      }, 2000);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setGuestData(null);
    setIsProcessing(false);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 p-6 md:p-12 relative pb-24 font-sans selection:bg-neutral-900 selection:text-white">
      <div className="max-w-xl mx-auto space-y-12 flex flex-col items-center">
        <div className="text-center border-b border-neutral-200 pb-8 w-full">
          <h2 className="text-[10px] font-bold tracking-[0.4em] text-neutral-400 uppercase mb-3">{projectNicknames}</h2>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-neutral-800">Scanner</h1>
        </div>

        {/* Camera Container */}
        <div className={`w-full max-w-md md:max-w-full mx-auto bg-neutral-100 rounded-[2.5rem] relative group overflow-hidden shadow-2xl border border-white ${facingMode === "user" ? "[&_video]:scale-x-[-1]" : ""}`}>
          <div id="reader" className="w-full bg-black [&_video]:w-full [&_video]:object-cover overflow-hidden"></div>
        </div>

        {/* Scanner Description */}
        <p className="text-center text-[10px] text-neutral-400 tracking-[0.2em] uppercase leading-relaxed -mt-6 max-w-[80%]">
          Point your camera at the guest's QR Code to initiate check-in
        </p>

        {/* Flip Camera Button */}
        <button 
          onClick={toggleCamera}
          className="flex items-center justify-center gap-3 w-full py-5 bg-white border border-neutral-200 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600 hover:text-neutral-900 hover:border-neutral-900 transition-all rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Flip Camera
        </button>

        {message && message.type !== 'success' && !showModal && (
          <div className={`w-full p-8 text-center font-bold transition-all duration-500 break-words leading-tight uppercase tracking-[0.2em] text-[10px] rounded-[2rem] border shadow-sm ${
            message.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-100' :
            'bg-white text-neutral-500 border-neutral-100'
          }`}>
            {message.text}
          </div>
        )}

        <div className="w-full flex justify-center">
          <a href="/dashboard" className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-300 hover:text-neutral-900 transition-colors border-b border-transparent hover:border-neutral-900 pb-1">
            Back to Dashboard
          </a>
        </div>
      </div>

      {/* Pop Welcome Success Modal */}
      {message && message.type === 'success' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-900/10 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in-95 duration-300 border border-emerald-100 p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-emerald-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-[10px] font-bold tracking-[0.4em] text-emerald-600 uppercase">Check-in Success</h2>
              <p className="text-3xl font-serif text-neutral-800 leading-tight uppercase tracking-tight">{message.text.replace('Welcome, ', '').replace('!', '')}</p>
            </div>
            <p className="text-[10px] font-medium tracking-[0.2em] text-neutral-400 uppercase">Welcome to the celebration</p>
          </div>
        </div>
      )}

      {/* Floating Flip Button for Mobile */}
      <button
        onClick={toggleCamera}
        className="md:hidden fixed bottom-10 right-10 w-16 h-16 bg-neutral-900 text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 rounded-full border-4 border-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </button>

      {/* Elegant Scan Result Modal */}
      {showModal && guestData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-100 max-h-[90vh] overflow-y-auto">
            <div className={`p-8 text-center text-white ${guestData.alreadyCheckedIn ? 'bg-rose-500' : 'bg-neutral-900'}`}>
              <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase">
                {guestData.alreadyCheckedIn ? "Already Checked In" : "Confirm Attendance"}
              </h2>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="w-full text-center space-y-2">
                <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.3em] block">Guest Name</label>
                <div className="text-3xl font-serif text-neutral-800 break-words max-w-full leading-tight uppercase tracking-tight">{guestData.name}</div>
              </div>

              {guestData.alreadyCheckedIn ? (
                <div className="text-center text-rose-600 font-medium bg-rose-50 p-6 rounded-2xl border border-rose-100 text-xs tracking-wider leading-relaxed">
                  This guest has already been registered as present for the event.
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.3em] block text-center">Number of Guests</label>
                    <div className="flex items-center justify-between bg-neutral-50 rounded-[1.5rem] p-3 border border-neutral-100">
                      <button 
                        onClick={() => setGuestData({...guestData, guestsCount: Math.max(1, guestData.guestsCount - 1)})}
                        className="w-14 h-14 flex items-center justify-center bg-white text-neutral-800 rounded-xl shadow-sm hover:shadow-md hover:bg-neutral-50 text-2xl font-serif transition-all active:scale-95"
                      >
                        —
                      </button>
                      <span className="text-4xl font-serif text-neutral-800">{guestData.guestsCount}</span>
                      <button 
                        onClick={() => setGuestData({...guestData, guestsCount: Math.min(10, guestData.guestsCount + 1)})}
                        className="w-14 h-14 flex items-center justify-center bg-white text-neutral-800 rounded-xl shadow-sm hover:shadow-md hover:bg-neutral-50 text-2xl font-serif transition-all active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {!guestData.isExisting && (
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.3em] block text-center">Best Wishes for the Couple</label>
                      <textarea
                        value={guestData.wishes}
                        onChange={(e) => setGuestData({...guestData, wishes: e.target.value})}
                        placeholder="Write your message here..."
                        className="w-full p-6 bg-neutral-50 border border-neutral-100 rounded-[1.5rem] text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/5 transition-all placeholder:text-neutral-300 min-h-[120px] resize-none"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                {guestData.alreadyCheckedIn ? (
                  <button 
                    onClick={handleCancel}
                    className="w-full py-5 bg-neutral-900 text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-2xl hover:bg-neutral-800 shadow-lg transition-all active:scale-[0.98]"
                  >
                    Close
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleCancel}
                      className="flex-1 py-5 bg-white border border-neutral-200 text-neutral-500 text-[10px] font-bold tracking-[0.2em] uppercase rounded-2xl hover:bg-neutral-50 hover:text-neutral-900 transition-all active:scale-[0.98]"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="flex-1 py-5 bg-neutral-900 text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-2xl hover:bg-neutral-800 shadow-lg shadow-neutral-200 transition-all active:scale-[0.98]"
                    >
                      Confirm
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
