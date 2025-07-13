"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import NProgress from "nprogress";

export default function NProgressProvider() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (router) {
      const origPush = router.push;
      const origReplace = router.replace;
      router.push = (...args) => {
        const url = typeof args[0] === "string" ? args[0] : args[0]?.pathname || "";
        if (url === pathname) {
          NProgress.done();
          return origPush.apply(router, args);
        }
        NProgress.start();
        return origPush.apply(router, args);
      };
      router.replace = (...args) => {
        const url = typeof args[0] === "string" ? args[0] : args[0]?.pathname || "";
        if (url === pathname) {
          NProgress.done();
          return origReplace.apply(router, args);
        }
        NProgress.start();
        return origReplace.apply(router, args);
      };
      return () => {
        router.push = origPush;
        router.replace = origReplace;
      };
    }
  }, [router, pathname]);

  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  return null;
} 