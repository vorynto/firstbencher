"use client";

import { useEffect } from "react";

type Props = {
    headCode: string;
    bodyCode: string;
};

/**
 * CustomCodeInjector
 *
 * Runs once on mount and injects admin-configured tracking scripts into the
 * correct DOM locations using createContextualFragment, which properly executes
 * <script> tags (unlike innerHTML which does not).
 *
 * Head code → appended to <head> (Google Analytics, GTM, Meta Pixel, etc.)
 * Body code → inserted at the start of <body> (GTM noscript, chat widgets, etc.)
 */
export default function CustomCodeInjector({ headCode, bodyCode }: Props) {
    useEffect(() => {
        if (headCode?.trim()) {
            try {
                const range = document.createRange();
                range.selectNode(document.head);
                const fragment = range.createContextualFragment(headCode);
                document.head.appendChild(fragment);
            } catch (e) {
                console.warn("[CustomCode] Head injection failed:", e);
            }
        }

        if (bodyCode?.trim()) {
            try {
                const range = document.createRange();
                range.selectNode(document.body);
                const fragment = range.createContextualFragment(bodyCode);
                // Insert after the first child (after this component's own node)
                const firstChild = document.body.firstChild;
                document.body.insertBefore(fragment, firstChild ? firstChild.nextSibling : null);
            } catch (e) {
                console.warn("[CustomCode] Body injection failed:", e);
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return null;
}
