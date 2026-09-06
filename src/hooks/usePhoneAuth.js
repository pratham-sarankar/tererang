// src/hooks/usePhoneAuth.js
import { useRef, useState, useCallback } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../config/firebase.js";
import { apiUrl } from "../config/env.js";
import { notifyCartAuthChange } from "../context/cartEvents.js";

const COUNTRY_CODE = "+91";
const API_URL = apiUrl("/api").replace(/\/$/, "");

// Shared phone OTP flow (Firebase client SDK) for Login and Register
export const usePhoneAuth = () => {
    const recaptchaContainerRef = useRef(null);
    const verifierRef = useRef(null);
    const confirmationResultRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const getVerifier = () => {
        if (!verifierRef.current) {
            verifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                size: "invisible",
            });
        }
        return verifierRef.current;
    };

    const sendOtp = useCallback(async (phoneNumber) => {
        setLoading(true);
        try {
            const verifier = getVerifier();
            confirmationResultRef.current = await signInWithPhoneNumber(
                auth,
                `${COUNTRY_CODE}${phoneNumber}`,
                verifier
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const confirmOtp = useCallback(async (code, name) => {
        setLoading(true);
        try {
            if (!confirmationResultRef.current) {
                throw new Error("OTP was not sent yet");
            }
            const credential = await confirmationResultRef.current.confirm(code);
            const idToken = await credential.user.getIdToken();

            const response = await fetch(`${API_URL}/auth/firebase-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken, name }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to verify OTP");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            notifyCartAuthChange();

            return data;
        } finally {
            setLoading(false);
        }
    }, []);

    return { recaptchaContainerRef, sendOtp, confirmOtp, loading };
};
