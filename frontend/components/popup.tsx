import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner";
import { string } from 'zod';
import jsPDF from 'jspdf';

interface PopUpProps {
    isOpen: boolean;
    onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ isOpen, onClose }) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

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

    const lastGeneratedNumber = useRef<number | null>(null);
    const generateSummaries = async (number: number) => {
        if (isGenerating || lastGeneratedNumber.current === number) {
            console.log('Already generating or same request, skipping');
            return; // Evita duplicar requests
        }
        setIsGenerating(true);
        setLoading(true);
        lastGeneratedNumber.current = number;
        console.log(`Starting to generate summaries of type: ${number}`);
        try {
            const pdfs = await fetchPDFs();
            if (!pdfs.length) {
                throw new Error('No PDFs found');
            }
            const pdf_ids = pdfs.map((pdf: { id: number }) => pdf.id);
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
            setIsGenerating(false);
            console.log('Finished generating summaries');
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 10;
        const maxLineWidth = pageWidth - margin * 2;

        // Adicionar título
        const title = "SubjectsMate Summary";
        doc.setFontSize(18);
        doc.text(title, pageWidth / 2, margin, { align: 'center' });

        // Adicionar uma linha abaixo do título
        doc.setLineWidth(0.5);
        doc.line(margin, margin + 10, pageWidth - margin, margin + 10);

        // Adicionar o texto
        doc.setFontSize(12);
        const textLines = doc.splitTextToSize(text, maxLineWidth);
        doc.text(textLines, margin, margin + 20); // Ajustar a posição do texto para ficar abaixo do título

        doc.save('summary.pdf');
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    if (!isOpen) return null;

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-content"
                style={{ pointerEvents: loading ? 'none' : 'auto' }}
                onClick={(event) => event.stopPropagation()}>
                <div className="flex justify-between mb-4">
                    <Button className="mr-2 bg-black text-white" onClick={() => generateSummaries(1)}>Short Summary</Button>
                    <Button className="mr-2 bg-black text-white" onClick={() => generateSummaries(2)}>Summary by Topics</Button>
                    <Button className="mr-2 bg-black text-white" onClick={() => generateSummaries(3)}>Extended Summary</Button>
                    <Button className = "bg-black text-white" onClick={() => generateSummaries(4)}>Brain Rot Summary</Button>
                </div>
                <div className="grid w-full gap-2">
                    {loading ? (
                        <div className="loading-overlay">
                            <Spinner show={loading} size="large" />
                        </div>
                    ) : (
                        <ScrollArea style={{ maxHeight: '500px' }}>
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <Textarea
                                    ref={textareaRef}
                                    value={text}
                                    onChange={handleTextChange}
                                    onInput={adjustTextareaHeight}
                                    style={{ height: 'auto', overflowY: 'auto' }}
                                />
                            </div>
                        </ScrollArea>
                    )}
                    <Button className = "bg-black text-white" onClick={handleDownload}>Download</Button>
                </div> 
            </div>
        </div>
    );
};

export default PopUp;
