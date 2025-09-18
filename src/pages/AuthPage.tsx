import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import TurnstileWidget from '@/components/TurnstileWidget';

// أيقونة جوجل
const GoogleIcon = () => ( <svg>...</svg> ); // الكود هنا كما هو

// أيقونة فيسبوك
const FacebookIcon = () => ( <svg>...</svg> ); // الكود هنا كما هو

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
    }, [navigate]);

    // ✨✨✨ تم إصلاح هذه الدوال وإعادة الكود المفقود ✨✨✨
    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) {
            toast({ title: "خطأ في تسجيل الدخول عبر جوجل", description: error.message, variant: "destructive" });
            setLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) {
            toast({ title: "خطأ في تسجيل الدخول عبر فيسبوك", description: error.message, variant: "destructive" });
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-background rtl p-4">
            
            <div className="w-full md:w-1/2 flex justify-center items-center p-8">
                <img
                    src="/hero-image.png"
                    alt="Serve Me Hero"
                    className="w-56 md:w-80 animate-float"
                />
            </div>

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
