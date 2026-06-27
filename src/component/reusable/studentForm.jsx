import { useState } from "react";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaPhoneAlt, FaGraduationCap, FaLightbulb, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import { MdNavigateNext, MdNavigateBefore, MdCategory, MdOutlineWhatsapp } from 'react-icons/md';

const StudentForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        visitAt: "",
        category: "",
        phone: "",
        whatsapp: "",
        courseVisitingFor: "",
        bachelorsCourse: "",
        reference: "",
        registerDoneBeforeVisit: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        if (!formData.name || !formData.phone) {
            toast.warning("Please fill in your name and phone number to continue.");
            return;
        }
        setStep(2);
    };

    const handlePrev = () => {
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            toast.warning("Please fill in required fields.");
            setStep(1);
            return;
        }
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Form submitted successfully! We will contact you soon.");
            setFormData({
                name: "",
                email: "",
                visitAt: "",
                category: "",
                phone: "",
                whatsapp: "",
                courseVisitingFor: "",
                bachelorsCourse: "",
                reference: "",
                registerDoneBeforeVisit: ""
            });
            setStep(1);
        }, 1500);
    };

    // Reusable radio "pill" so options are big enough to tap comfortably on a phone
    const RadioPill = ({ name, value, label, checked }) => (
        <label
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 text-sm font-medium rounded-xl border px-3 py-3 cursor-pointer transition-all duration-200 select-none
                ${checked
                    ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                    : "border-gray-300 text-gray-700 active:bg-gray-50"
                }`}
        >
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={handleChange}
                className="sr-only"
            />
            {label}
        </label>
    );

    return (
        <div className=" rounded-2xl  flex justify-center  p-4 overflow-x-scroll">
            <div className="w-full max-w-3xl h-[140%] rounded-2x   bg-gray-100  border  border-gray-100">

                {/* Header */}
                <div className="bg-blue-600 px-6 sm:px-8 py-5 sm:py-6 rounded-2xl text-center flex flex-col items-center">
                    <img
                        src="https://ru-website-bucket.s3.ap-south-1.amazonaws.com/images/svg/logowhite.svg"
                        alt="Logo"
                        className="h-16 sm:h-36 object-contain mb-3"
                       
                    />
                    <span className="hidden text-white font-bold text-lg tracking-wide mb-3">RU</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Student Registration</h2>
                    
                </div>

                {/* Progress bar */}
                <div className="px-6 sm:px-8 pt-5">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
                        <span className={step === 1 ? "text-blue-700" : "text-gray-400"}>1. Your details</span>
                        <span className={step === 2 ? "text-blue-700" : "text-gray-400"}>2. Course details</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: step === 1 ? "50%" : "100%" }}
                        />
                    </div>
                </div>
  <div className="flex-1 overflow-y-auto ">

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 sm:p-8 pt-5 pb-8">
                    {step === 1 && (
                        <div className="flex flex-col gap-5 animate-[fadeIn_0.3s_ease-in-out]">

                            {/* 1. Name */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        autoComplete="name"
                                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-base text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>

                            {/* 2. Email */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        autoComplete="email"
                                        inputMode="email"
                                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-base text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* 3. Visit At */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                                    <FaClipboardList className="text-gray-500" /> Visit At
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <RadioPill name="visitAt" value="Headquarter Office" label="Headquarter Office" checked={formData.visitAt === "Headquarter Office"} />
                                    <RadioPill name="visitAt" value="University Campus" label="University Campus" checked={formData.visitAt === "University Campus"} />
                                </div>
                            </div>

                            {/* 4. Category */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                                    <MdCategory className="text-gray-500" /> Category
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {["General", "OBC", "SC/ST", "Other"].map((cat) => (
                                        <RadioPill key={cat} name="category" value={cat} label={cat} checked={formData.category === cat} />
                                    ))}
                                </div>
                            </div>

                            {/* 5. Phone Number */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 234 567 8900"
                                        autoComplete="tel"
                                        inputMode="tel"
                                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-base text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mt-2">
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-base py-3.5 rounded-lg transition-all duration-200 shadow-sm"
                                >
                                    Next <MdNavigateNext className="text-lg" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col gap-5 animate-[fadeIn_0.3s_ease-in-out]">

                            {/* 6. WhatsApp Number */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    WhatsApp Number
                                </label>
                                <div className="relative">
                                    <MdOutlineWhatsapp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="whatsapp"
                                        value={formData.whatsapp}
                                        onChange={handleChange}
                                        placeholder="+1 234 567 8900"
                                        autoComplete="tel"
                                        inputMode="tel"
                                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-base text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* 7. Course Visiting For */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                                    <FaGraduationCap className="text-gray-500" /> Course Visiting For
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <RadioPill name="courseVisitingFor" value="Under Graduation" label="Under Graduation" checked={formData.courseVisitingFor === "Under Graduation"} />
                                    <RadioPill name="courseVisitingFor" value="Post Graduation" label="Post Graduation" checked={formData.courseVisitingFor === "Post Graduation"} />
                                </div>
                            </div>

                            {/* 8. Bachelors all course select type */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                                    <FaGraduationCap className="text-gray-500" /> Bachelors Course Selection
                                </label>
                                <div className="relative">
                                    <select
                                        name="bachelorsCourse"
                                        value={formData.bachelorsCourse}
                                        onChange={handleChange}
                                        className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg text-base text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 bg-white appearance-none"
                                    >
                                        <option value="">Select a course</option>
                                        <option value="B.Tech">B.Tech</option>
                                        <option value="B.Sc">B.Sc</option>
                                        <option value="B.Com">B.Com</option>
                                        <option value="B.A">B.A</option>
                                        <option value="BBA">BBA</option>
                                        <option value="BCA">BCA</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>

                            {/* 9. Reference */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Reference
                                </label>
                                <div className="relative">
                                    <FaLightbulb className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="reference"
                                        value={formData.reference}
                                        onChange={handleChange}
                                        placeholder="How did you hear about us?"
                                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-base text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* 10. Register Done Before Visit */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                                    <FaCheckCircle className="text-gray-500" /> Registration Done Before Visit?
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <RadioPill name="registerDoneBeforeVisit" value="Yes" label="Yes" checked={formData.registerDoneBeforeVisit === "Yes"} />
                                    <RadioPill name="registerDoneBeforeVisit" value="No" label="No" checked={formData.registerDoneBeforeVisit === "No"} />
                                </div>
                            </div>

                            <div className="mt-2 flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    className="w-full sm:w-1/3 order-2 sm:order-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-medium text-base py-3.5 rounded-lg transition-all duration-200"
                                >
                                    <MdNavigateBefore className="text-lg" /> Previous
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-2/3 order-1 sm:order-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-medium text-base py-3.5 rounded-lg transition-all duration-200 shadow-sm"
                                >
                                    {loading ? (
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                    ) : (
                                        "Submit Registration"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
  </div>
            </div>
            
        </div>
    );
};

export default StudentForm;