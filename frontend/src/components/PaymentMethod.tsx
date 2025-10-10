import React, { useState } from 'react';
import '../styles/PaymentMethod.css';

interface PaymentMethodProps {
    totalAmount: number;
    ticketPrice: number;
    onPaymentMethodSelected: (paymentMethod: string) => void;
    onBack: () => void;
}

interface PaymentOption {
    id: string;
    name: string;
    description: string;
    icon: string;
    popular?: boolean;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({
    totalAmount,
    ticketPrice,
    onPaymentMethodSelected,
    onBack
}) => {
    const [selectedMethod, setSelectedMethod] = useState<string>('');

    const paymentOptions: PaymentOption[] = [
        {
            id: 'ideal',
            name: 'iDEAL',
            description: 'Betaal veilig met je eigen bank',
            icon: '🏦',
            popular: true
        },
        {
            id: 'bancontact',
            name: 'Bancontact',
            description: 'Betaal met je Bancontact kaart',
            icon: '💳'
        },
        {
            id: 'creditcard',
            name: 'Creditcard',
            description: 'Visa, Mastercard, American Express',
            icon: '💳'
        },
        {
            id: 'paypal',
            name: 'PayPal',
            description: 'Betaal met je PayPal account',
            icon: '🔵'
        },
        {
            id: 'sofort',
            name: 'Sofort',
            description: 'Direct betalen via je bank',
            icon: '⚡'
        },
        {
            id: 'klarna',
            name: 'Klarna',
            description: 'Betaal later of in termijnen',
            icon: '🛍️'
        }
    ];

    const handleMethodSelect = (methodId: string) => {
        setSelectedMethod(methodId);
    };

    const handleContinue = () => {
        if (selectedMethod) {
            onPaymentMethodSelected(selectedMethod);
        }
    };

    const totalPrice = totalAmount * ticketPrice;

    return (
        <div className="payment-method-container">
            <div className="payment-method-header">
                <h2 className="payment-method-title">Betaalmethode selecteren</h2>
                <p className="payment-method-subtitle">
                    Kies je gewenste betaalwijze voor {totalAmount} ticket{totalAmount > 1 ? 's' : ''}
                </p>
            </div>

            <div className="payment-method-summary">
                <h3 className="payment-method-summary-title">Bestelling overzicht</h3>
                <div className="payment-method-summary-item">
                    <span>{totalAmount} ticket{totalAmount > 1 ? 's' : ''} × €{ticketPrice}</span>
                    <span className="payment-method-summary-total">€{totalPrice}</span>
                </div>
                <div className="payment-method-summary-divider"></div>
                <div className="payment-method-summary-final">
                    <span>Totaal</span>
                    <span className="payment-method-summary-amount">€{totalPrice}</span>
                </div>
            </div>

            <div className="payment-method-options">
                <h3 className="payment-method-options-title">Selecteer betaalmethode</h3>
                
                <div className="payment-method-grid">
                    {paymentOptions.map((option) => (
                        <div
                            key={option.id}
                            className={`payment-method-option ${
                                selectedMethod === option.id ? 'selected' : ''
                            } ${option.popular ? 'popular' : ''}`}
                            onClick={() => handleMethodSelect(option.id)}
                        >
                            {option.popular && (
                                <div className="payment-method-popular-badge">
                                    Populair
                                </div>
                            )}
                            
                            <div className="payment-method-option-content">
                                <div className="payment-method-option-icon">
                                    {option.icon}
                                </div>
                                <div className="payment-method-option-info">
                                    <div className="payment-method-option-name">
                                        {option.name}
                                    </div>
                                    <div className="payment-method-option-description">
                                        {option.description}
                                    </div>
                                </div>
                                <div className="payment-method-option-radio">
                                    <div className={`payment-method-radio ${
                                        selectedMethod === option.id ? 'checked' : ''
                                    }`}>
                                        {selectedMethod === option.id && <div className="payment-method-radio-dot" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="payment-method-actions">
                <button
                    onClick={onBack}
                    className="payment-method-btn-secondary"
                >
                    ← Terug
                </button>
                
                <button
                    onClick={handleContinue}
                    disabled={!selectedMethod}
                    className="payment-method-btn-primary"
                >
                    Doorgaan naar betaling
                </button>
            </div>

            <div className="payment-method-security">
                <div className="payment-method-security-content">
                    <span className="payment-method-security-icon">🔒</span>
                    <span className="payment-method-security-text">
                        Alle betalingen worden veilig verwerkt met SSL-encryptie
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethod;