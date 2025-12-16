import React from "react";
import { User, Building } from "lucide-react";

const SectionToggle = ({ activeSection, setActiveSection }) => {
    return (
        <div className="px-4 pt-4 bg-[#0F1628] flex gap-2">
            <button
                className={`flex-1 py-2 rounded ${activeSection === "PERSONAL" ? "bg-[#1C2A41]" : "bg-[#0F1628]"}`}
                onClick={() => setActiveSection("PERSONAL")}
            >
                <div className="flex items-center justify-center gap-2">
                    <User size={16} /> Personal
                </div>
            </button>
            <button
                className={`flex-1 py-2 rounded ${activeSection === "INDUSTRY" ? "bg-[#1C2A41]" : "bg-[#0F1628]"}`}
                onClick={() => setActiveSection("INDUSTRY")}
            >
                <div className="flex items-center justify-center gap-2">
                    <Building size={16} /> Work
                </div>
            </button>
        </div>
    );
};

export default SectionToggle;
