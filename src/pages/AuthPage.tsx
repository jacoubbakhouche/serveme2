import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import TurnstileWidget from '@/components/TurnstileWidget';

// أيقونة جوجل
const GoogleIcon = () => (
    <svg className="ml-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <title>Google</title>
        <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.82 1.9-5.78 0-10.47-4.88-10.47-10.92S6.7 1.08 12.48 1.08c3.24 0 5.4 1.35 6.67 2.53l-2.52 2.34c-.82-.76-2.04-1.35-4.15-1.35-4.82 0-8.72 3.9-8.72 8.72s3.9 8.72 8.72 8.72c5.33 0 8.14-3.83 8.4-7.42h-8.4v-3.28z"/>
    </svg>
);

// أيقونة فيسبوك
const FacebookIcon = () => (
    <svg className="ml-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <title>Facebook</title>
        <path fill="currentColor" d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.732 0 1.325-.593 1.325-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
    </svg>
);


const AuthPage = () => {
    const [loading, setLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string>('');
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                const user = session.user;
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                if (error && error.code === 'PGRST116') {
                    navigate('/complete-profile');
                } else if (profile) {
                    navigate('/dashboard');
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate, toast]);

    const handleGoogleLogin = async () => { /* ... (لا تغيير هنا) ... */ };
    const handleFacebookLogin = async () => { /* ... (لا تغيير هنا) ... */ };

    return (
        // ✨ الحاوية الرئيسية لجعل التصميم متجاوب ✨
        <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-background rtl p-4">
            
            {/* ✨ القسم الخاص بالصورة الكبيرة ✨ */}
            <div className="w-full md:w-1/2 flex justify-center items-center p-8">
                <img
                    src="/auth-logo2.png" // الصورة التي حفظتها في مجلد public
                    alt="Serve Me Hero"
                   className="w-56 md:w-80 animate-float" // تطبيق حركة السحابة
                />
            </div>

            {/* ✨ القسم الخاص ببطاقة تسجيل الدخول ✨ */}
            <div className="w-full md:w-1/2 flex justify-center items-center">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-primary">Serve Me</CardTitle>
                        <CardDescription>
                            😉دخول أو اشتراك فوري. سيتم إنشاء حسابك تلقائيًا إذا كنت مستخدمًا جديدًا
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 pt-4">
                        <TurnstileWidget onVerify={setTurnstileToken} />

                        <div className="space-y-3">
                            <Button
                                variant="secondary"
                                className="w-full text-lg py-6"
                                onClick={handleGoogleLogin}
                                disabled={loading || !turnstileToken}
                            >
                                {loading ? '...جاري التحميل' : 'المتابعة باستخدام جوجل'}
                                <GoogleIcon />
                            </Button>
                            <Button
                                variant="default"
                                className="w-full text-lg py-6 bg-[#1877F2] hover:bg-[#166fe5] text-white"
                                onClick={handleFacebookLogin}
                                disabled={loading || !turnstileToken}
                            >
                                {loading ? '...جاري التحميل' : 'المتابعة باستخدام فيسبوك'}
                                <FacebookIcon />
                            </Button>
                        </div>

                        <p className="px-8 text-center text-xs text-muted-foreground mt-2">
                            بالاستمرار، أنت توافق على
                            <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
                                {' '}شروط الخدمة{' '}
                            </Link>
                            الخاصة بنا.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AuthPage;
