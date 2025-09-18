import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import TurnstileWidget from '@/components/TurnstileWidget';

// ✨ 1. استيراد المكونات الجديدة للنموذج والتبويبات
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// أيقونات ... (لا تغيير هنا)
const GoogleIcon = () => ( <svg>...</svg> );
const FacebookIcon = () => ( <svg>...</svg> );

const AuthPage = () => {
    // ✨ 2. إضافة حالات جديدة للبريد الإلكتروني، كلمة السر، ونمط الواجهة
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
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
        return () => subscription.unsubscribe();
    }, [navigate]);

    // ✨ 3. إضافة الدوال الخاصة بتسجيل الدخول وإنشاء الحساب
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            toast({ title: "خطأ في تسجيل الدخول", description: error.message, variant: "destructive" });
        }
        // لا نحتاج navigate هنا، onAuthStateChange سيتكفل بالأمر
        setLoading(false);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            toast({ title: "خطأ في إنشاء الحساب", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "تم إنشاء الحساب بنجاح", description: "تم إرسال رابط التأكيد إلى بريدك الإلكتروني." });
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => { /* ... (لا تغيير هنا) ... */ };
    const handleFacebookLogin = async () => { /* ... (لا تغيير هنا) ... */ };

    return (
        <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-background rtl p-4">
            <div className="w-full md:w-1/2 flex justify-center items-center p-8">
                <img src="/hero-image.png" alt="Serve Me Hero" className="w-56 md:w-80 animate-float" />
            </div>

            <div className="w-full md:w-1/2 flex justify-center items-center">
                <Card className="w-full max-w-sm">
                    {/* ✨ 4. استخدام نظام التبويبات الجديد */}
                    <Tabs value={mode} onValueChange={(value) => setMode(value as 'login' | 'signup')}>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-bold text-primary">Serve Me</CardTitle>
                            <CardDescription>
                                اختر الطريقة التي تناسبك للدخول إلى عالم الخدمات
                            </CardDescription>
                            <TabsList className="grid w-full grid-cols-2 mt-4">
                                <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                                <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
                            </TabsList>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <TabsContent value="login">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">البريد الإلكتروني</Label>
                                        <Input id="login-email" type="email" placeholder="email@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">كلمة السر</Label>
                                        <Input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? '...جاري الدخول' : 'تسجيل الدخول'}
                                    </Button>
                                </form>
                            </TabsContent>
                            <TabsContent value="signup">
                                <form onSubmit={handleSignUp} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                                        <Input id="signup-email" type="email" placeholder="email@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">كلمة السر</Label>
                                        <Input id="signup-password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? '...جاري الإنشاء' : 'إنشاء حساب جديد'}
                                    </Button>
                                </form>
                            </TabsContent>
                            
                            {/* ✨ 5. الفاصل البصري */}
                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">أو أكمل باستخدام</span>
                                </div>
                            </div>

                            <TurnstileWidget onVerify={setTurnstileToken} />
                            
                            <div className="space-y-3">
                                <Button variant="secondary" className="w-full" onClick={handleGoogleLogin} disabled={!turnstileToken}>
                                    المتابعة باستخدام جوجل <GoogleIcon />
                                </Button>
                                <Button className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white" onClick={handleFacebookLogin} disabled={!turnstileToken}>
                                    المتابعة باستخدام فيسبوك <FacebookIcon />
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
                    </Tabs>
                </Card>
            </div>
        </div>
    );
};

export default AuthPage;
