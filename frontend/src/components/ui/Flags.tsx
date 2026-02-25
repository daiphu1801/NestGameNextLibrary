import React from 'react';

export const USFlag = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 480"
        className={className}
        aria-label="United States Flag"
    >
        <path fill="#bd3d44" d="M0 0h640v480H0" />
        <path stroke="#fff" strokeWidth="37" d="M0 55.3h640M0 129h640M0 202.8h640M0 276.5h640M0 350.2h640M0 423.9h640" />
        <path fill="#192f5d" d="M0 0h296.2v258.5H0" />
        <g fill="#fff">
            <g id="s18">
                <g id="s9">
                    <g id="s5">
                        <g id="s4">
                            <path id="s" d="M24.7 12l2.3 7 7.3-.2-6 4.3 2.1 7.2L24.7 26l-5.7 4.3 2.1-7.2-6-4.3 7.3.2z" />
                            <use xlinkHref="#s" x="42" />
                            <use xlinkHref="#s" x="84" />
                            <use xlinkHref="#s" x="126" />
                        </g>
                        <use xlinkHref="#s" x="168" />
                    </g>
                    <use xlinkHref="#s4" x="210" />
                </g>
                <use xlinkHref="#s9" y="37" />
            </g>
            <use xlinkHref="#s18" y="74" />
            <use xlinkHref="#s9" y="148" />
            <use xlinkHref="#s5" y="185" />
            <use xlinkHref="#s4" y="222" />
            <use xlinkHref="#s" y="37" x="21" />
            <use xlinkHref="#s" y="37" x="63" />
            <use xlinkHref="#s" y="37" x="105" />
            <use xlinkHref="#s" y="37" x="147" />
            <use xlinkHref="#s" y="37" x="189" />
            <use xlinkHref="#s" y="37" x="231" />
            <use xlinkHref="#s" y="111" x="21" />
            <use xlinkHref="#s" y="111" x="63" />
            <use xlinkHref="#s" y="111" x="105" />
            <use xlinkHref="#s" y="111" x="147" />
            <use xlinkHref="#s" y="111" x="189" />
            <use xlinkHref="#s" y="111" x="231" />
            <use xlinkHref="#s" y="185" x="21" />
            <use xlinkHref="#s" y="185" x="63" />
            <use xlinkHref="#s" y="185" x="105" />
            <use xlinkHref="#s" y="185" x="147" />
            <use xlinkHref="#s" y="185" x="189" />
            <use xlinkHref="#s" y="185" x="231" />
        </g>
    </svg>
);

export const VietnamFlag = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 480"
        className={className}
        aria-label="Vietnam Flag"
    >
        <path fill="#da251d" d="M0 0h640v480H0z" />
        <path fill="#ff0" d="M320 123.5l34.4 105.9 111.3 0-90 65.4 34.4 105.9-90-65.4-90 65.4 34.4-105.9-90-65.4 111.3 0z" />
    </svg>
);
