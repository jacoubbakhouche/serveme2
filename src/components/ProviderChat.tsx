// Before (الكود الحالي)
} catch (error) {
  toast({ title: "خطأ في الميكروفون", description: "يرجى منح الإذن للوصول إلى الميكروفون.", variant: "destructive" });
}

// After (الكود المُحسَّن)
} catch (error) {
  // ✨ التحقق من نوع الخطأ لتوفير رسالة دقيقة
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      toast({
        title: "تم رفض الإذن",
        description: "للتسجيل الصوتي، يرجى السماح بالوصول للميكروفون من إعدادات المتصفح أو التطبيق.",
        variant: "destructive",
      });
    } else if (error.name === 'NotFoundError') {
      toast({
        title: "لا يوجد ميكروفون",
        description: "لم يتم العثور على جهاز ميكروفون متصل.",
        variant: "destructive",
      });
    } else {
       toast({
        title: "حدث خطأ",
        description: "لم نتمكن من الوصول إلى الميكروفون. حاول مرة أخرى.",
        variant: "destructive",
      });
    }
  } else {
    // For generic errors
    console.error("An unexpected error occurred:", error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ غير متوقع أثناء محاولة بدء التسجيل.",
      variant: "destructive",
    });
  }
}
