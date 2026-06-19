import { QRCodeCanvas } from "qrcode.react";

function QRCodePage() {
    return (
        <div className="flex flex-col items-center mt-6 justify-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm mx-auto">
            <style>
                {`
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: calc(100% - 4px); opacity: 0; }
                }
                .animate-scan {
                    animation: scan 2.5s ease-in-out infinite;
                }
                `}
            </style>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Scan QR Code</h2>
            <p className="text-sm text-gray-500 mb-8 text-center">
                Point your camera at the code below to access the student form.
            </p>

            {/* QR Code Container with Scanner Animation */}
            <div className="relative p-4 bg-white rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-blue-100 overflow-hidden">
                {/* Scanner Line */}
                <div className="absolute left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_10px_2px_rgba(59,130,246,0.6)] animate-scan z-20" />

                <QRCodeCanvas
                    value="http://localhost:5173/student-form"
                    size={220}
                    level="H"
                    fgColor="#1e293b"
                    bgColor="#ffffff"
                    className="relative z-10 rounded-lg"
                />

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-600 rounded-tl-xl z-20" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-600 rounded-tr-xl z-20" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-600 rounded-bl-xl z-20" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-600 rounded-br-xl z-20" />
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-blue-600 text-sm font-medium">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Secure Access
            </div>
        </div>
    );
}

export default QRCodePage;