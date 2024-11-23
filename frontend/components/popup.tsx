import React from 'react';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface PopUpProps {
    isOpen: boolean;
    onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-content">
                <span className="close" onClick={onClose}>&times;</span>
                <div className="flex justify-between mb-4">
                    <Button className="mr-2">Button 1</Button>
                    <Button className="mr-2">Button 2</Button>
                    <Button className="mr-2">Button 3</Button>
                    <Button>Button 4</Button>
                </div>
                <div className="grid w-full gap-2">
                    <Textarea placeholder="Type your message here." />
                    <Button>Send message</Button>
                </div>
            </div>
        </div>
    );
};

export default PopUp;