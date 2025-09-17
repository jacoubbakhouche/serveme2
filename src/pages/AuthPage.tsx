// src/pages/AuthPage.tsx
import React, { useState } from 'react'; // useEffect is removed
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom'; // useNavigate is removed

// ... (GoogleIcon and FacebookIcon components remain the same) ...

const AuthPage = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // The entire useEffect hook for onAuthStateChange has been DELETED from this file.
    
    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: 'https://serveme2.vercel.app' },
        });
        if (error) {
            toast({ title: "خطأ في تسجيل الدخول", description: error.message, variant: "destructive" });
            setLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        // ... (this function is also correct)
    };

    return (
        // ... (the JSX for this component is correct and does not need changes) ...
    );
};

export default AuthPage;
