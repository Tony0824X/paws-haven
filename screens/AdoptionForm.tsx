
import React, { useState } from 'react';
import { Pet, ApplicationFormData } from '../types';
import { submitApplication } from '../services/applicationService';

interface AdoptionFormProps {
  pet: Pet;
  onBack: () => void;
  onComplete: () => void;
}

const AdoptionForm: React.FC<AdoptionFormProps> = ({ pet, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: '',
    phone: '',
    email: '',
    job: '',
    experience: '',
    environment: '',
    companionTime: '',
    reason: '',
    commitment: false,
    followup: false
  });

  // Validation functions for each step
  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = '請輸入您的姓名';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '請輸入您的電話號碼';
    } else if (!/^[0-9\-\+\s]{8,}$/.test(formData.phone)) {
      newErrors.phone = '請輸入有效的電話號碼';
    }
    if (!formData.email.trim()) {
      newErrors.email = '請輸入您的電子郵件';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '請輸入有效的電子郵件格式';
    }
    if (!formData.job.trim()) {
      newErrors.job = '請輸入您的職業';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};

    if (!formData.experience) {
      newErrors.experience = '請選擇您的養寵經驗';
    }
    if (!formData.environment.trim()) {
      newErrors.environment = '請描述您的居住環境';
    }
    if (!formData.companionTime) {
      newErrors.companionTime = '請選擇每日陪伴時間';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};

    if (!formData.reason.trim()) {
      newErrors.reason = '請分享您想領養的原因';
    }
    if (!formData.commitment) {
      newErrors.commitment = '請確認您的領養承諾';
    }
    if (!formData.followup) {
      newErrors.followup = '請同意追蹤訪問條款';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    // Validate current step
    let isValid = false;
    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    } else if (step === 3) {
      isValid = validateStep3();
    }

    if (!isValid) {
      return;
    }

    if (step < totalSteps) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(step + 1);
      setErrors({});
    } else {
      // Submit the form
      setIsSubmitting(true);
      try {
        const result = await submitApplication(pet.id, formData);
        if (result.success) {
          console.log('Application submitted successfully:', result.id);
          setApplicationId(result.id || null);
          setShowSuccess(true);
        } else {
          console.error('Failed to submit application:', result.error);
          alert('提交失敗：' + result.error);
        }
      } catch (error) {
        console.error('Error submitting application:', error);
        alert('提交時發生錯誤，請稍後再試');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(step - 1);
      setErrors({});
    } else {
      onBack();
    }
  };

  const updateField = (field: keyof ApplicationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onComplete();
  };

  // Check if current step is complete for button state
  const isStepComplete = () => {
    if (step === 1) {
      return formData.name && formData.phone && formData.email && formData.job;
    } else if (step === 2) {
      return formData.experience && formData.environment && formData.companionTime;
    } else if (step === 3) {
      return formData.reason && formData.commitment && formData.followup;
    }
    return false;
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans">
      <div className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-primary/5">
        <div className="flex items-center p-4 pb-2 justify-between">
          <button onClick={handlePrev} className="text-[#1b130d] dark:text-white flex size-12 shrink-0 items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h2 className="text-lg font-bold flex-1 text-center pr-12">領養 {pet.name} 申請表單</h2>
        </div>
      </div>

      <main className="max-w-[480px] mx-auto pb-24">
        <div className="flex flex-col gap-3 p-6 pt-8">
          <div className="flex gap-6 justify-between items-end">
            <p className="text-base font-bold text-[#5e412f] dark:text-[#d1c2b8]">申請進度</p>
            <p className="text-primary text-sm font-bold bg-primary/10 px-3 py-1 rounded-full">第 {step} 步，共 {totalSteps} 步</p>
          </div>
          <div className="rounded-full bg-[#e7d9cf] dark:bg-zinc-800 h-3 w-full overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-in-out shadow-lg"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-6 py-4 min-h-[400px]">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-10 duration-500">
              <div className="mb-8">
                <h3 className="text-[28px] font-bold text-[#1b130d] dark:text-white">基本聯絡資訊</h3>
                <p className="text-[#9a6c4c] dark:text-zinc-400 text-base mt-2">請提供您的真實資訊，以便志工與您聯繫。</p>
              </div>
              <div className="flex flex-col gap-4">
                <FormGroup label="真實姓名 *" error={errors.name}>
                  <input
                    className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="請輸入您的全名"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                  />
                </FormGroup>
                <FormGroup label="聯絡電話 *" error={errors.phone}>
                  <input
                    className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="09XX-XXX-XXX"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    required
                  />
                </FormGroup>
                <FormGroup label="電子郵件 *" error={errors.email}>
                  <input
                    className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="yourname@example.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                  />
                </FormGroup>
                <FormGroup label="目前職業 *" error={errors.job}>
                  <input
                    className={`form-input ${errors.job ? 'border-red-500' : ''}`}
                    placeholder="例如：工程師、自由業..."
                    value={formData.job}
                    onChange={(e) => updateField('job', e.target.value)}
                    required
                  />
                </FormGroup>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-10 duration-500">
              <div className="mb-8">
                <h3 className="text-[28px] font-bold text-[#1b130d] dark:text-white">居住環境與經驗</h3>
                <p className="text-[#9a6c4c] dark:text-zinc-400 text-base mt-2">讓我們了解新成員未來的家環境。</p>
              </div>
              <div className="flex flex-col gap-4">
                <FormGroup label="養寵經驗 *" error={errors.experience}>
                  <select
                    className={`form-select ${errors.experience ? 'border-red-500' : ''}`}
                    value={formData.experience}
                    onChange={(e) => updateField('experience', e.target.value)}
                    required
                  >
                    <option value="">請選擇經驗程度</option>
                    <option value="none">第一次養寵物</option>
                    <option value="some">曾有養寵物經驗</option>
                    <option value="expert">豐富經驗 / 現職志工</option>
                  </select>
                </FormGroup>
                <FormGroup label="居住環境描述 *" error={errors.environment}>
                  <textarea
                    className={`form-textarea ${errors.environment ? 'border-red-500' : ''}`}
                    placeholder="例如：公寓、有圍欄的院子、家中是否有其他寵物..."
                    rows={4}
                    value={formData.environment}
                    onChange={(e) => updateField('environment', e.target.value)}
                    required
                  />
                </FormGroup>
                <FormGroup label="每日陪伴時間 *" error={errors.companionTime}>
                  <select
                    className={`form-select ${errors.companionTime ? 'border-red-500' : ''}`}
                    value={formData.companionTime}
                    onChange={(e) => updateField('companionTime', e.target.value)}
                    required
                  >
                    <option value="">平均每日陪伴時間</option>
                    <option value="2">2小時以內</option>
                    <option value="4">2-4小時</option>
                    <option value="8">4-8小時</option>
                    <option value="all">幾乎全天有人在</option>
                  </select>
                </FormGroup>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-10 duration-500">
              <div className="mb-8">
                <h3 className="text-[28px] font-bold text-[#1b130d] dark:text-white">領養承諾</h3>
                <p className="text-[#9a6c4c] dark:text-zinc-400 text-base mt-2">最後一步，請確認您的領養意願。</p>
              </div>
              <div className="flex flex-col gap-6">
                <FormGroup label={`為什麼想領養 ${pet.name}？ *`} error={errors.reason}>
                  <textarea
                    className={`form-textarea ${errors.reason ? 'border-red-500' : ''}`}
                    placeholder="請分享您的想法..."
                    rows={5}
                    value={formData.reason}
                    onChange={(e) => updateField('reason', e.target.value)}
                    required
                  />
                </FormGroup>
                <div className="space-y-4">
                  <label className={`flex items-start gap-4 p-5 rounded-2xl border ${errors.commitment ? 'border-red-500' : 'border-[#e7d9cf] dark:border-zinc-800'} bg-white dark:bg-zinc-900/50 cursor-pointer hover:border-primary/40 transition-all`}>
                    <input
                      type="checkbox"
                      className="mt-1.5 size-5 rounded text-primary focus:ring-primary border-[#e7d9cf] dark:border-zinc-700"
                      checked={formData.commitment}
                      onChange={(e) => updateField('commitment', e.target.checked)}
                    />
                    <span className="text-[15px] font-medium leading-relaxed">我承諾將提供充足的愛與照顧，並負起終身養育的責任。 *</span>
                  </label>
                  {errors.commitment && <p className="text-red-500 text-sm ml-2">{errors.commitment}</p>}

                  <label className={`flex items-start gap-4 p-5 rounded-2xl border ${errors.followup ? 'border-red-500' : 'border-[#e7d9cf] dark:border-zinc-800'} bg-white dark:bg-zinc-900/50 cursor-pointer hover:border-primary/40 transition-all`}>
                    <input
                      type="checkbox"
                      className="mt-1.5 size-5 rounded text-primary focus:ring-primary border-[#e7d9cf] dark:border-zinc-700"
                      checked={formData.followup}
                      onChange={(e) => updateField('followup', e.target.checked)}
                    />
                    <span className="text-[15px] font-medium leading-relaxed">我同意領養後的追蹤訪問 (如：照片更新或現場查看)。 *</span>
                  </label>
                  {errors.followup && <p className="text-red-500 text-sm ml-2">{errors.followup}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 px-6 flex flex-col gap-4">
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="w-full h-[64px] bg-primary hover:bg-[#e06b1a] disabled:bg-gray-300 dark:disabled:bg-zinc-800 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                提交中...
              </>
            ) : (
              <>
                {step === totalSteps ? '提交領養申請' : '前往下一步'}
                <span className="material-symbols-outlined">{step === totalSteps ? 'verified' : 'arrow_forward'}</span>
              </>
            )}
          </button>

          <div className="flex gap-4 p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
            <span className="material-symbols-outlined text-amber-500 text-2xl">security</span>
            <p className="text-[13px] text-[#9a6c4c] dark:text-zinc-400 leading-relaxed font-medium">
              您的資料將受到加密保護，僅供 Paws Haven 志工審核領養資格使用。
            </p>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">check_circle</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1b130d] dark:text-white mb-3">申請提交成功！</h3>
              <p className="text-[#9a6c4c] dark:text-zinc-400 mb-2">
                您對 <span className="font-bold text-primary">{pet.name}</span> 的領養申請已成功提交。
              </p>
              <p className="text-sm text-[#9a6c4c] dark:text-zinc-500 mb-6">
                我們的志工將在 3-5 個工作日內審核您的申請，並透過電話或郵件與您聯繫。
              </p>
              {applicationId && (
                <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl px-4 py-2 mb-6">
                  <p className="text-xs text-[#9a6c4c] dark:text-zinc-500">申請編號</p>
                  <p className="font-mono font-bold text-sm">{applicationId.slice(0, 8).toUpperCase()}</p>
                </div>
              )}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleSuccessClose}
                  className="flex-1 bg-primary hover:bg-[#e06b1a] text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  查看申請進度
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .form-input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid #e7d9cf;
          background-color: white;
          height: 3.75rem;
          padding: 0 1.25rem;
          outline: none;
          transition: all 0.2s;
          font-weight: 500;
        }
        .form-input:focus {
          border-color: #ee7c2b;
          box-shadow: 0 0 0 4px rgba(238, 124, 43, 0.08);
        }
        .form-input.border-red-500 {
          border-color: #ef4444;
        }
        .dark .form-input {
          background-color: #27272a;
          border-color: #3f3f46;
          color: white;
        }
        .form-select {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid #e7d9cf;
          background-color: white;
          height: 3.75rem;
          padding: 0 1.25rem;
          outline: none;
          appearance: none;
          font-weight: 500;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239a6c4c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1.25rem center;
          background-size: 1.5rem;
        }
        .form-select.border-red-500 {
          border-color: #ef4444;
        }
        .dark .form-select {
          background-color: #27272a;
          border-color: #3f3f46;
          color: white;
        }
        .form-textarea {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid #e7d9cf;
          background-color: white;
          padding: 1.25rem;
          outline: none;
          resize: none;
          font-weight: 500;
          transition: all 0.2s;
        }
        .form-textarea:focus {
          border-color: #ee7c2b;
          box-shadow: 0 0 0 4px rgba(238, 124, 43, 0.08);
        }
        .form-textarea.border-red-500 {
          border-color: #ef4444;
        }
        .dark .form-textarea {
          background-color: #27272a;
          border-color: #3f3f46;
          color: white;
        }
      `}</style>
    </div>
  );
};

const FormGroup: React.FC<{ label: string, children: React.ReactNode, error?: string }> = ({ label, children, error }) => (
  <div className="flex flex-col gap-2">
    <p className="text-[15px] font-bold text-[#1b130d] dark:text-zinc-300 ml-1">{label}</p>
    {children}
    {error && <p className="text-red-500 text-sm ml-1">{error}</p>}
  </div>
);

export default AdoptionForm;
