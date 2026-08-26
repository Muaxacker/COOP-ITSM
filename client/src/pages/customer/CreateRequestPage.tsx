import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronRight, ChevronLeft, CheckCircle, Landmark, CreditCard, Smartphone, ArrowRightLeft, Building2, MessageSquareWarning, Check } from 'lucide-react';
import { getCategories } from '../../services/admin.service';
import { createRequest } from '../../services/request.service';
import { ServiceCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/States';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'ATM Services': Landmark,
  'Card Services': CreditCard,
  'Mobile Banking': Smartphone,
  'Transfer Issues': ArrowRightLeft,
  'Account Services': Building2,
  'General Complaint': MessageSquareWarning,
};

const STEPS = [
  { label: 'Issue Type', description: 'Select category' },
  { label: 'Details', description: 'Describe your issue' },
  { label: 'Review', description: 'Confirm & submit' },
];

export function CreateRequestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState<{ requestNumber: string; id: string } | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });

  const mutation = useMutation({
    mutationFn: createRequest,
    onSuccess: (data) => {
      if (data.success && data.data) {
        setSubmitted({ requestNumber: data.data.requestNumber, id: data.data.id });
        toast.success('Request submitted successfully!');
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to submit request');
    },
  });

  if (isLoading) return <LoadingState />;

  function handleSubmit() {
    if (!selectedCategory) return;
    mutation.mutate({
      categoryId: selectedCategory.id,
      title: title || `${selectedCategory.name} Issue`,
      description,
    });
  }

  // Success screen
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Request Submitted!</h2>
        <p className="text-sm text-text-muted mt-2 mb-1">Your request number is:</p>
        <p className="text-2xl font-bold font-mono text-teal mb-6">{submitted.requestNumber}</p>
        <p className="text-sm text-text-secondary mb-8">
          We've received your request and will begin processing it shortly. You'll be notified of any updates.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate('/requests')}>
            View All Requests
          </Button>
          <Button onClick={() => navigate(`/requests/${submitted.id}`)}>
            Track Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Submit a Service Request</h1>
        <p className="text-sm text-text-muted mt-1">
          {selectedCategory ? `${selectedCategory.name}` : 'Tell us what you need help with'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                i < step ? 'bg-teal border-teal text-white' :
                i === step ? 'border-teal text-teal bg-white ring-4 ring-teal/15' :
                'border-gray-200 text-text-muted bg-white'
              )}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <div className="hidden sm:block">
                <p className={cn('text-xs font-medium', i === step ? 'text-teal' : 'text-text-muted')}>{s.label}</p>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-3', i < step ? 'bg-teal' : 'bg-gray-200')} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Select category */}
      {step === 0 && (
        <div>
          <h2 className="text-base font-semibold text-text-primary mb-4">What type of issue are you experiencing?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories?.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] || MessageSquareWarning;
              const isSelected = selectedCategory?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all',
                    isSelected
                      ? 'border-teal bg-teal/5'
                      : 'border-gray-200 bg-white hover:border-teal/40'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    isSelected ? 'bg-teal text-white' : 'bg-gray-100 text-text-muted'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{cat.name}</p>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{cat.description}</p>
                    <p className="text-xs text-text-muted mt-1">
                      Deadline: {cat.defaultDeadlineHours}h · {cat.defaultPriority} priority
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-teal ml-auto flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setStep(1)}
              disabled={!selectedCategory}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-base font-semibold text-text-primary">Describe your issue</h2>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Request Title <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <input
              type="text"
              className="w-full h-10 rounded-lg border border-gray-200 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              placeholder={`e.g. "${selectedCategory?.name} Issue"`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>
          <Textarea
            label="Description"
            placeholder="Please describe your issue in detail. Include any relevant information such as dates, amounts, or error messages."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            required
          />
          {selectedCategory && (
            <div className="bg-teal/5 border border-teal/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-teal mb-2">Selected Category</p>
              <p className="text-sm font-medium text-text-primary">{selectedCategory.name}</p>
              <p className="text-xs text-text-muted mt-1">
                This issue is handled by <strong>{selectedCategory.department.name}</strong> with a service deadline of <strong>{selectedCategory.defaultDeadlineHours} hours</strong>.
              </p>
            </div>
          )}
          <div className="flex justify-between">
            <Button variant="outline" icon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              onClick={() => setStep(2)}
              disabled={description.length < 10}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Review Request
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-base font-semibold text-text-primary">Review & Submit</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            <div className="p-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Category</p>
              <p className="text-sm font-medium text-text-primary">{selectedCategory?.name}</p>
              <p className="text-xs text-text-muted">{selectedCategory?.department.name}</p>
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Title</p>
              <p className="text-sm text-text-primary">{title || `${selectedCategory?.name} Issue`}</p>
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{description}</p>
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Service Deadline</p>
              <p className="text-sm text-text-primary">{selectedCategory?.defaultDeadlineHours} hours from submission</p>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" icon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={handleSubmit} loading={mutation.isPending}>
              Submit Request
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
