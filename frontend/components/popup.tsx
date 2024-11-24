import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area"
import { string } from 'zod';


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

    const fetchPDFs = async (): Promise<any[]> => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/pdfs'); // Substitua pelo endpoint correto da sua API
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched PDFs:', data.pdfs);
            return data || []; // Supondo que a resposta tenha um campo 'pdfs' com a lista de PDFs
        } catch (error) {
            console.error('Error fetching PDFs:', error);
            return [];
        }
    };

    const generateSummaries = async (number: number) => {
        setLoading(true);
        try {
            const pdfs = await fetchPDFs();
            if (!pdfs.length) {
                throw new Error('No PDFs found');
            }
            const pdf_ids = pdfs.map((pdf: { id: number }) => pdf.id); // Definindo o tipo do parâmetro 'pdf'
            const response = await fetch('http://localhost:8000/api/generate-summaries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ number, pdf_ids }),
            });
            const data = await response.json();
            console.log('API response data:', data);
            if (data.choices) {
                setText(data.choices[0].message.content);
                console.log('Extracted text:', data.choices[0].message.content);
            } else {
                console.error('Unexpected API response format:', data);
            }
        } catch (error) {
            console.error('Error fetching text:', error);
        } finally {
            setLoading(false);
        }
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