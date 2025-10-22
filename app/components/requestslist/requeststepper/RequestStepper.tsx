import React from 'react';
import styles from './requeststepper.module.css';
import { RequestStatus } from '@/interfaces/enums';

interface Step {
    status: RequestStatus;
    label: string;
    icon: string;
}

interface RequestStatusStepperProps {
    currentStatus: RequestStatus;
    requestedDate?: string | Date;
    approvedDate?: string | Date;
    completedDate?: string | Date;
}

const RequestStepper: React.FC<RequestStatusStepperProps> = ({ currentStatus, requestedDate, approvedDate, completedDate }) =>
{
    const steps: Step[] = [
        { status: RequestStatus.PENDING, label: 'Pendiente', icon: '⏳' },
        { status: RequestStatus.APPROVED, label: 'Aprobada', icon: '✓' },
        { status: RequestStatus.IN_PROGRESS, label: 'En Proceso', icon: '🚚' },
        { status: RequestStatus.COMPLETED, label: 'Completada', icon: '✓' }
    ];

    const getStepIndex = (status: RequestStatus): number => {
        const index = steps.findIndex(step => step.status === status);
        return index !== -1 ? index : -1;
    };

    const currentStepIndex = getStepIndex(currentStatus);

    // Manejar estados especiales (REJECTED, CANCELED)
    const isRejected = currentStatus === RequestStatus.REJECTED;
    const isCanceled = currentStatus === RequestStatus.CANCELED;
    const isSpecialStatus = isRejected || isCanceled;

    const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'pending' | 'rejected' | 'canceled' => {
        if (isSpecialStatus)
        {
            if (stepIndex === 0) return 'completed';
            if (stepIndex === 1) return isRejected ? 'rejected' : 'canceled';
            return 'pending';
        }

        if (stepIndex < currentStepIndex) return 'completed';
        if (stepIndex === currentStepIndex) return 'current';

        return 'pending';
    };

    const getDateForStep = (stepIndex: number): string =>
    {
        if (stepIndex === 0 && requestedDate) return new Date(requestedDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        if (stepIndex === 1 && approvedDate) return new Date(approvedDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        if (stepIndex === 3 && completedDate) return new Date(completedDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

        return '';
    };

    return (
        <div className={styles.stepperContainer}>
            <div className={styles.stepper}>
                {steps.map((step, index) =>
                {
                    const stepStatus = getStepStatus(index);
                    const dateLabel = getDateForStep(index);
                    const showDate = stepStatus === 'completed' || stepStatus === 'current';

                    return (
                        <React.Fragment key={step.status}>
                            <div className={`${styles.step} ${styles[stepStatus]}`}>
                                <div className={styles.stepIcon}>
                                    {stepStatus === 'rejected' ? '✗' :
                                        stepStatus === 'canceled' ? '⊘' : step.icon}
                                </div>
                                <div className={styles.stepContent}>
                                    <span className={styles.stepLabel}>
                                        {stepStatus === 'rejected' ? 'Rechazada' :
                                            stepStatus === 'canceled' ? 'Cancelada' : step.label}
                                    </span>
                                    {showDate && dateLabel && (
                                        <span className={styles.stepDate}>{dateLabel}</span>
                                    )}
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`${styles.stepLine} ${
                                    stepStatus === 'completed' ? styles.completed :
                                        stepStatus === 'rejected' || stepStatus === 'canceled' ? styles.rejected : ''
                                }`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default RequestStepper;