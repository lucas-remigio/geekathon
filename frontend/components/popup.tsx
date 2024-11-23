import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PopUpProps {
    isOpen: boolean;
    onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ isOpen, onClose }) => {
    const [text, setText] = useState('');

    const generateSummaries = (number: number) => {
        console.log('Fetching data from the backend with number:', number);
        fetch('http://localhost:8000/api/generate-summaries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: 'Your prompt here', number }), // Envia o prompt como string e o número como inteiro
        })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    return response.json().then(err => {
                        console.error('Error response:', err);
                        throw new Error('Network response was not ok');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('API response data:', data);
                if (data.choices) {
                    setText(data.choices[0].message.content);
                    console.log('Extracted text:', data.choices[0].message.content);
                } else {
                    console.error('Unexpected API response format:', data);
                }
            })
            .catch(error => {
                console.error('Error fetching text:', error);
            });
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-content">
                <span className="close" onClick={onClose}>&times;</span>
                <div className="flex justify-between mb-4">
                    <Button className="mr-2" onClick={() => generateSummaries(1)}>Summary Max 100 words</Button>
                    <Button className="mr-2" onClick={() => generateSummaries(2)}>Summary by Topics</Button>
                    <Button className="mr-2" onClick={() => generateSummaries(3)}>Extended Summary</Button>
                    <Button onClick={() => generateSummaries(4)}>Brain Rot Summary</Button>
                </div>
                <div className="grid w-full gap-2">
                    <Textarea value={text} readOnly />
                    <Button>Download</Button>
                </div>
            </div>
        </div>
    );
};

export default PopUp;