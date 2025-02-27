import { useState } from "react";
import "../styles/Calculator.css"; // your custom CSS

function Calculator() {
  const [functionType, setFunctionType] = useState("present_value_pf");
  const [inputs, setInputs] = useState({
    futureValue: "",
    presentValue: "",
    payment: "",
    gradient: "",
    rate: "",
    periods: ""
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const calculate = (e) => {
    e.preventDefault();

    // Convert numeric fields
    const FV = parseFloat(inputs.futureValue);
    const PV = parseFloat(inputs.presentValue);
    const A  = parseFloat(inputs.payment);
    const G  = parseFloat(inputs.gradient);
    const i  = parseFloat(inputs.rate) / 100; // convert % to decimal
    const n  = parseFloat(inputs.periods);

    let answer = 0;

    // Basic validation
    if (isNaN(i) || isNaN(n) || n < 0) {
      setResult("Invalid rate or periods");
      return;
    }

    switch (functionType) {
      case "present_value_pf":
        // P = F / (1 + i)^n
        if (isNaN(FV)) {
          setResult("Invalid Future Value");
          return;
        }
        answer = FV / Math.pow(1 + i, n);
        break;

      case "future_value_fp":
        // F = P * (1 + i)^n
        if (isNaN(PV)) {
          setResult("Invalid Present Value");
          return;
        }
        answer = PV * Math.pow(1 + i, n);
        break;

      case "present_value_pa":
        // P = A * [(1 - (1 + i)^(-n)) / i]
        if (isNaN(A)) {
          setResult("Invalid Payment (A)");
          return;
        }
        answer = A * ((1 - Math.pow(1 + i, -n)) / ((i)*  Math.pow(1 + i, -n)));
        break;

      case "annual_payment_ap":
        // A = P * [i(1 + i)^n / ((1 + i)^n - 1)]
        if (isNaN(PV)) {
          setResult("Invalid Present Value (P)");
          return;
        }
        answer =
          PV *
          ((i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1));
        break;

      case "future_value_fa":
        // F = A * [((1 + i)^n - 1) / i]
        if (isNaN(A)) {
          setResult("Invalid Payment (A)");
          return;
        }
        answer = A * ((Math.pow(1 + i, n) - 1) / i);
        break;

      case "annual_payment_af":
        // A = F * [i / ((1 + i)^n - 1)]
        if (isNaN(FV)) {
          setResult("Invalid Future Value (F)");
          return;
        }
        answer = FV * (i / (Math.pow(1 + i, n) - 1));
        break;

      case "present_value_pg":
        // P = G * [ (1 - (1 + i)^(-n))/ i - n*(1 + i)^(-n ) ]
        // Factor form: P = G * (P/G, i, n)
        if (isNaN(G)) {
          setResult("Invalid Gradient (G)");
          return;
        }
        answer =
          G *
          ( ((1 - Math.pow(1 + i, -n)) / (i*Math.pow(1 + i, -n))) -(
            n / Math.pow(1 + i, -n))
          )*(1/i);
        break;

      case "annual_payment_ag":
        // A = G * [ (1 / i) - (n / [ (1 + i)^n - 1 ]) ]
        // Factor form: A = G * (A/G, i, n)
        if (isNaN(G)) {
          setResult("Invalid Gradient (G)");
          return;
        }
        // We'll break it into smaller steps for clarity
        const term1 = (1 / i);
        const term2 = n / (Math.pow(1 + i, n) - 1);
        answer = G * (term1 - term2);
        break;

      default:
        setResult("Unknown function");
        return;
    }

    setResult(answer.toFixed(2));
  };

  return (
    <div className="calculator-container">
      <h2 className="calculator-header">Calculator</h2>
      <form onSubmit={calculate} className="calculator-form">
        {/* FUNCTION SELECTION */}
        <div className="form-group">
          <label htmlFor="functionType">Function:</label>
          <select
            id="functionType"
            value={functionType}
            onChange={(e) => {
              setFunctionType(e.target.value);
              setResult(null); // clear result on function change
            }}
          >
            <option value="present_value_pf">Present Value (P/F)</option>
            <option value="future_value_fp">Future Value (F/P)</option>
            <option value="present_value_pa">Present Value (P/A)</option>
            <option value="annual_payment_ap">Annual Payment (A/P)</option>
            <option value="future_value_fa">Future Value (F/A)</option>
            <option value="annual_payment_af">Annual Payment (A/F)</option>
            <option value="present_value_pg">Present Value (P/G)</option>
            <option value="annual_payment_ag">Annual Payment (A/G)</option>
          </select>
        </div>

        {/* DYNAMIC FIELDS DEPENDING ON FUNCTION */}
        {functionType === "present_value_pf" && (
          <>
            <div className="form-group">
              <label htmlFor="futureValue">Future Value (F):</label>
              <input
                type="number"
                id="futureValue"
                name="futureValue"
                value={inputs.futureValue}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        {functionType === "future_value_fp" && (
          <>
            <div className="form-group">
              <label htmlFor="presentValue">Present Value (P):</label>
              <input
                type="number"
                id="presentValue"
                name="presentValue"
                value={inputs.presentValue}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        {functionType === "present_value_pa" && (
          <>
            <div className="form-group">
              <label htmlFor="payment">Payment (A):</label>
              <input
                type="number"
                id="payment"
                name="payment"
                value={inputs.payment}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        {functionType === "annual_payment_ap" && (
          <>
            <div className="form-group">
              <label htmlFor="presentValue">Present Value (P):</label>
              <input
                type="number"
                id="presentValue"
                name="presentValue"
                value={inputs.presentValue}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        {functionType === "future_value_fa" && (
          <>
            <div className="form-group">
              <label htmlFor="payment">Payment (A):</label>
              <input
                type="number"
                id="payment"
                name="payment"
                value={inputs.payment}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        {functionType === "annual_payment_af" && (
          <>
            <div className="form-group">
              <label htmlFor="futureValue">Future Value (F):</label>
              <input
                type="number"
                id="futureValue"
                name="futureValue"
                value={inputs.futureValue}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        {functionType === "present_value_pg" && (
          <>
            <div className="form-group">
              <label htmlFor="gradient">Gradient (G):</label>
              <input
                type="number"
                id="gradient"
                name="gradient"
                value={inputs.gradient}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        {functionType === "annual_payment_ag" && (
          <>
            <div className="form-group">
              <label htmlFor="gradient">Gradient (G):</label>
              <input
                type="number"
                id="gradient"
                name="gradient"
                value={inputs.gradient}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        {/* COMMON FIELDS: rate and periods */}
        <div className="form-group">
          <label htmlFor="rate">Interest Rate (%):</label>
          <input
            type="number"
            id="rate"
            name="rate"
            value={inputs.rate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="periods">Number of Periods (n):</label>
          <input
            type="number"
            id="periods"
            name="periods"
            value={inputs.periods}
            onChange={handleChange}
            required
          />
        </div>

        <button className="submit-button" type="submit">Calculate</button>
      </form>

      {result !== null && (
        <div className="result">
          <h3>Result: {result}</h3>
        </div>
      )}
    </div>
  );
}

export default Calculator;

