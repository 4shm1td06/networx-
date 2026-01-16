import React from "react";
import { User, Building } from "lucide-react";

const SectionToggle = ({ activeSection, setActiveSection }) => {
    return (
        <div className="px-4 py-3 bg-[#0F1628] border-b border-[#232e48]">
            <div className="chat-section-toggle">
                <button
                    className={`chat-section-button ${activeSection === "PERSONAL" ? "chat-section-button-active" : "chat-section-button-inactive"}`}
                    onClick={() => setActiveSection("PERSONAL")}
                    title="Personal connections"
                >
                    <div className="flex items-center justify-center gap-2">
                        <User size={16} /> Personal
                    </div>
                </button>
                <button
                    className={`chat-section-button ${activeSection === "INDUSTRY" ? "chat-section-button-active" : "chat-section-button-inactive"}`}
                    onClick={() => setActiveSection("INDUSTRY")}
                    title="Work and industry connections"
                >
                    <div className="flex items-center justify-center gap-2">
                        <Building size={16} /> Work
                    </div>
                </button>
            </div>
        </div>
    );
};

export default SectionToggle;
