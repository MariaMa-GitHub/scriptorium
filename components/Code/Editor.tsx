import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Paper, TextField, Button, CircularProgress } from '@mui/material';
import LanguageSelect from './LanguageSelect';
import OutputPanel from './OutputPanel';
import { useTheme } from '@mui/material/styles';
import CreateTemplateModal from '@/components/Templates/CreateTemplateModal';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import LanguageChangeDialog from './LanguageChangeDialog';

export default function CodeEditor() {

    const getDefaultCode = (language: string): string => {
        const templates: { [key: string]: string } = {
          python: '# Start coding here\n# Use print() to output results',
          javascript: '// Start coding here\n// Use console.log() to output results',
          java: `public class Main {
    public static void main(String[] args) {
        // Start coding here
        // Use System.out.println() to output results
    }
}`,
          cpp: `#include <iostream>
using namespace std;
      
int main() {
    // Start coding here
    // Use cout to output results
    return 0;
}`,
          c: `#include <stdio.h>
      
int main() {
    // Start coding here
    // Use printf() to output results
    return 0;
}`,
          ruby: '# Start coding here\n# Use puts to output results',
          rust: `fn main() {
    // Start coding here
    // Use println!() to output results
}`,
          php: `<?php
    // Start coding here
    // Use echo to output results
?>`,
          bash: `#!/bin/bash
# Start coding here
# Use echo to output results`,
          perl: `#!/usr/bin/perl
# Start coding here
# Use print to output results`};
      
        return templates[language] || '// Start coding here';
    };

    const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
    const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);

    const handleLanguageChange = (newLanguage: string) => {
        const currentDefaultCode = getDefaultCode(language);
        if (!code || code === currentDefaultCode) {
            setLanguage(newLanguage);
            setCode(getDefaultCode(newLanguage));
        } else {
            setPendingLanguage(newLanguage);
            setIsLanguageDialogOpen(true);
        }
    };

    const handleConfirmLanguageChange = () => {
        if (pendingLanguage) {
            setLanguage(pendingLanguage);
            setCode(getDefaultCode(pendingLanguage));
            setPendingLanguage(null);
        }
        setIsLanguageDialogOpen(false);
    };

    const theme = useTheme();
    const router = useRouter();
    const { code: initialCode, language: initialLanguage } = router.query;
    
    const [code, setCode] = useState(
        typeof initialCode === 'string' ? initialCode : getDefaultCode(
            typeof initialLanguage === 'string' ? initialLanguage : 'python'
        )
    );
    const [language, setLanguage] = useState(
        typeof initialLanguage === 'string' ? initialLanguage : 'python'
    );
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | undefined>();
    const [executionTime, setExecutionTime] = useState<number | undefined>();
    const [isExecuting, setIsExecuting] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    
    const { user } = useAuth();

    const handleCodeChange = (value: string | undefined) => {
        setCode(value || '');
    };

    const handleExecute = async () => {
        setIsExecuting(true);
        setError(undefined);
        setOutput('');
        const startTime = performance.now();
    
        try {
            const response = await fetch('/api/code/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code,
                    language: language.toUpperCase(),
                    input,
                }),
            });
            
            const data = await response.json();
            const endTime = performance.now();
            setExecutionTime(Math.round(endTime - startTime));
            
            if (response.ok) {
                if (data.stderr) {
                    setError(data.stderr);
                }
                if (data.stdout) {
                    setOutput(data.stdout);
                }
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError('An error occurred while executing the code');
        } finally {
            setIsExecuting(false);
        }
    };

    const handleSaveTemplate = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        setIsTemplateModalOpen(true);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ width: 200 }}>
                    <LanguageSelect 
                        language={language}
                        onLanguageChange={handleLanguageChange}
                    />
                </Box>
                <Button
                    variant="contained"
                    onClick={handleExecute}
                    disabled={isExecuting}
                    sx={{ ml: 'auto' }}
                >
                    {isExecuting ? <CircularProgress size={24} /> : 'Run Code'}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSaveTemplate}
                    sx={{ ml: 1 }}
                >
                    Save as Template
                </Button>
            </Box>

            <Paper elevation={0} sx={{ 
                height: '60vh',
                border: 2,
                borderColor: theme => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
                overflow: 'hidden' 
            }}>
                <Editor
                    height="100%"
                    defaultLanguage="python"
                    language={language}
                    value={code}
                    onChange={handleCodeChange}
                    theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'vs-light'}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false, 
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 },
                        scrollbar: {
                            alwaysConsumeMouseWheel: false 
                        }
                    }}
                />
            </Paper>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="Input"
                    multiline
                    rows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    sx={{ 
                        flex: 1,
                        '& .MuiInputBase-root': {
                            height: '150px'
                        }
                    }}
                    placeholder="Program input (stdin)"
                />
                <Box sx={{ flex: 1 }}>
                    <OutputPanel
                        output={output}
                        error={error}
                        isLoading={isExecuting}
                        executionTime={executionTime}
                    />
                </Box>
            </Box>

            <CreateTemplateModal
                open={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                code={code}
                language={language}
            />

            <LanguageChangeDialog
                open={isLanguageDialogOpen}
                onClose={() => setIsLanguageDialogOpen(false)}
                onConfirm={handleConfirmLanguageChange}
                newLanguage={pendingLanguage || ''}
            />

        </Box>
    );
}