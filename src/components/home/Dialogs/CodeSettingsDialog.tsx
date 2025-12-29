import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { useConnection } from "@/contexts/ConnectionContext.tsx";

const defaultCodeSettings = { usePermanentCode: false, permanentCode: "", expirationMinutes: null, maxUses: 1 };

const CodeSettingsDialog = ({ show, setShow }) => {
    const { handleSaveCodeSettings } = useConnection();
    const [tempSettings, setTempSettings] = useState(defaultCodeSettings);

    return (
        <Dialog open={show} onOpenChange={setShow}>
            <DialogContent className="sm:max-w-md bg-[#121A2F] border-[#232e48] text-networx-light">
                <DialogHeader>
                    <DialogTitle>Connection Code Settings</DialogTitle>
                    <DialogDescription>Customize how your connection codes work</DialogDescription>
                </DialogHeader>

                {/* Permanent code / Expiration / Max uses UI */}
                {/* For brevity, same UI logic as original Home.tsx */}
                <div className="py-4">
                    <p>Settings UI here (checkboxes, sliders, inputs)</p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setShow(false)}>Cancel</Button>
                    <Button onClick={() => handleSaveCodeSettings(tempSettings)}>Save Settings</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CodeSettingsDialog;
