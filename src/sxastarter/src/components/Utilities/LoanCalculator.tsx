/* eslint-disable */
import React, { useState, useEffect, ReactNode } from 'react';
import { Field, Text } from '@sitecore-jss/sitecore-jss-nextjs';
import { useI18n } from 'next-localization';

interface Fields {
  BankFee: Field<number>;
  Currency: Field<string>;
  InterestRate: Field<number>;
  MaxAmount: Field<number>;
  MaxTerm: Field<number>;
  MinAmount: Field<number>;
  MinTerm: Field<number>;
  TermName: Field<string>;
}

export type LoanCalculatorProps = {
  params: { [key: string]: string };
  fields: Fields;
};

const ResultLine = ({ left, right }: { left: ReactNode; right: ReactNode }) => {
  return (
    <div className="row align-items-center justify-content-between">
      <div className="col-auto">
        <span>{left}</span>
      </div>
      <div className="col-auto">
        <span className="fw-bold">{right}</span>
      </div>
    </div>
  );
};

export const Default = (props: LoanCalculatorProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { t } = useI18n();

  const [loanAmount, setLoanAmount] = useState(
    Math.round((props.fields.MinAmount.value + props.fields.MaxAmount.value) / 2)
  );
  const [loanTerm, setLoanTerm] = useState(
    Math.round((props.fields.MinTerm.value + props.fields.MaxTerm.value) / 2)
  );
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');


    try {
      // Send login request directly to the controller
      const response = await fetch('/api/Login/VirtualLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ username }).toString(),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage(data.message);
        setUser(data.user);
        // Optionally refresh the page to update authentication status
        // window.location.reload();
      } else {
        setError(data.message || 'Login failed.');
      }

      console.log(data);
    } catch (error) {

      const errorObj = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        toString: String(error)
      };

      console.error('Login error:', errorObj);
    }

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('username', username);

      // Send login request to the VirtualLogin endpoint
      const response = await fetch('/api/login/virtual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setUser(data.user);
        // Optionally refresh the page to update authentication status
        // window.location.reload();
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('An error occurred while trying to log in.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const monthlyInterestRate = props.fields.InterestRate.value / 100 / 12;

    const monthlyPaymentCalculation =
      (loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -loanTerm));
    setMonthlyPayment(monthlyPaymentCalculation);

    const totalDebtCalculation = monthlyPaymentCalculation * loanTerm + props.fields.BankFee.value;
    setTotalDebt(totalDebtCalculation);

    const totalInterestCalculation = totalDebtCalculation - loanAmount - props.fields.BankFee.value;
    setTotalInterest(parseFloat(totalInterestCalculation.toFixed(2)));
  }, [loanAmount, loanTerm, props.fields.InterestRate.value, props.fields.BankFee.value]);

  return (
    <div
      className={`component loan-calculator ${props.params.styles.trimEnd()}`}
      id={id ? id : undefined}
    >
      <div className="loan-calculator-input-group">
        <div className="row justify-content-between">
          <div className="col-auto">
            <label htmlFor="loan-amount">{t('Amount') || 'Amount'}</label>
          </div>
          <div className="col-auto">
            <div className="loan-calculator-input-wrapper">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="26"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z" />
              </svg>
              <input
                type="number"
                id="loan-amount"
                name="loan-amount"
                min={props.fields.MinAmount.value}
                max={props.fields.MaxAmount.value}
                value={loanAmount}
                onChange={(e) => setLoanAmount(parseInt(e.target.value))}
              />
              <span className="fw-bold">
                <Text field={props.fields.Currency} />
              </span>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="loan-calculator-range-wrapper">
              <input
                type="range"
                id="loan-amount-range"
                name="loan-amount-range"
                min={props.fields.MinAmount.value}
                max={props.fields.MaxAmount.value}
                value={loanAmount}
                onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                style={{
                  backgroundSize: `${loanAmount < props.fields.MinAmount.value
                    ? '0'
                    : loanAmount > props.fields.MaxAmount.value
                      ? '100'
                      : ((loanAmount - props.fields.MinAmount.value) * 100) /
                      (props.fields.MaxAmount.value - props.fields.MinAmount.value)
                    }% 100%`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="row justify-content-between">
          <div className="col-auto">
            <span>
              <Text field={props.fields.MinAmount} /> <Text field={props.fields.Currency} />
            </span>
          </div>
          <div className="col-auto">
            <span>
              <Text field={props.fields.MaxAmount} /> <Text field={props.fields.Currency} />
            </span>
          </div>
        </div>
      </div>

      <div className="loan-calculator-input-group">
        <div className="row justify-content-between">
          <div className="col-auto">
            <label htmlFor="loan-amount">{t('Term of repayment') || 'Term of repayment'}</label>
          </div>
          <div className="col-auto">
            <div className="loan-calculator-input-wrapper">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="26"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z" />
              </svg>
              <input
                type="number"
                id="loan-term"
                name="loan-term"
                min={props.fields.MinTerm.value}
                max={props.fields.MaxTerm.value}
                value={loanTerm}
                onChange={(e) => setLoanTerm(parseInt(e.target.value))}
              />
              <span className="fw-bold">
                <Text field={props.fields.TermName} />
              </span>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="loan-calculator-range-wrapper">
              <input
                type="range"
                id="loan-term-range"
                name="loan-term-range"
                min={props.fields.MinTerm.value}
                max={props.fields.MaxTerm.value}
                value={loanTerm}
                onChange={(e) => setLoanTerm(parseInt(e.target.value))}
                style={{
                  backgroundSize: `${loanTerm < props.fields.MinTerm.value
                    ? '0'
                    : loanTerm > props.fields.MaxTerm.value
                      ? '100'
                      : ((loanTerm - props.fields.MinTerm.value) * 100) /
                      (props.fields.MaxTerm.value - props.fields.MinTerm.value)
                    }% 100%`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="row justify-content-between">
          <div className="col-auto">
            <span>
              <Text field={props.fields.MinTerm} /> <Text field={props.fields.TermName} />
            </span>
          </div>
          <div className="col-auto">
            <span>
              <Text field={props.fields.MaxTerm} /> <Text field={props.fields.TermName} />
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 mb-4">
        <button
          className="btn btn-primary"
          onClick={async () => {
            try {
              const response = await fetch('/api/sitecore/My/myAction', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                }
              });
              const data = await response.json();
              alert('Action completed: ' + JSON.stringify(data));
            } catch (error) {
              console.error('Error calling myAction:', error);
              alert('Error calling action');
            }
          }}
        >
          My Action
        </button>
      </div>

      <div className="container mt-4">
        <h2 className="mb-3">Virtual User Login</h2>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group mb-3">
            <label htmlFor="username" className="form-label">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              placeholder="Enter username"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !username.trim()}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
        {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}

        {user && (
          <div className="card mt-3 p-3">
            <h3>User Information:</h3>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Display Name:</strong> {user.displayName}</p>
            <p><strong>Status:</strong> {user.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
          </div>
        )}
      </div>

      <div className="loan-calculator-results">
        <div className="loan-calculator-monthly-payment">
          <ResultLine
            left={t('Monthly payment') || 'Monthly payment'}
            right={
              <>
                {monthlyPayment.toFixed(2)} <Text field={props.fields.Currency} />
              </>
            }
          />
        </div>
        <ResultLine
          left={t('Interest rate') || 'Interest rate'}
          right={
            <>
              <Text field={props.fields.InterestRate} />%
            </>
          }
        />
        <ResultLine
          left={t('Bank package fee') || 'Bank package fee'}
          right={
            <>
              <Text field={props.fields.BankFee} /> <Text field={props.fields.Currency} />
            </>
          }
        />
        <ResultLine
          left={t('Total interest') || 'Total interest'}
          right={
            <>
              {totalInterest.toFixed(2)} <Text field={props.fields.Currency} />
            </>
          }
        />
        <ResultLine
          left={t('Total debt') || 'Total debt'}
          right={
            <>
              {totalDebt.toFixed(2)} <Text field={props.fields.Currency} />
            </>
          }
        />
      </div>
    </div>
  );
};
