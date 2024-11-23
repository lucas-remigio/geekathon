import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area"


interface PopUpProps {
    isOpen: boolean;
    onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ isOpen, onClose }) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            generateSummaries(1);
        }
    }, [isOpen]);

    useEffect(() => {
        adjustTextareaHeight();
    }, [text]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (loading) {
            interval = setInterval(() => {
                setProgress(prev => (prev >= 100 ? 0 : prev + 1));
            }, 75);
        } else {
            setProgress(0);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const generateSummaries = (number: number) => {
        console.log('Fetching data from the backend with number:', number);
        setLoading(true);
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
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-content" style={{ pointerEvents: loading ? 'none' : 'auto' }}>
                <div className="flex justify-between mb-4">
                    <Button className="mr-2" onClick={() => generateSummaries(1)}>Short Summary</Button>
                    <Button className="mr-2" onClick={() => generateSummaries(2)}>Summary by Topics</Button>
                    <Button className="mr-2" onClick={() => generateSummaries(3)}>Extended Summary</Button>
                    <Button onClick={() => generateSummaries(4)}>Brain Rot Summary</Button>
                </div>
                <div className="grid w-full gap-2">
                    {loading ? (
                        <div className="loading-overlay">
                            <Progress value={progress} />
                        </div>
                    ) : (
                        <ScrollArea style={{ maxHeight: '500px' }}>
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <Textarea
                                    ref={textareaRef}
                                    value={text}
                                    readOnly
                                    onInput={adjustTextareaHeight}
                                    style={{ height: 'auto', overflowY: 'auto' }}
                                />
                            </div>
                        </ScrollArea>
                    )}
                    <Button>Download</Button>
                </div>
            </div>
        </div>
    );
};

export default PopUp;