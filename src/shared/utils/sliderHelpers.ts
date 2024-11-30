interface LogSliderConfig {
  minValue: number;
  maxValue: number;
  minSlider?: number;
  maxSlider?: number;
}

// Create a generic function for logarithmic slider conversions
export const createLogSliderHandlers = (config: LogSliderConfig) => {
  const {
    minValue,
    maxValue,
    minSlider = 0,
    maxSlider = 100
  } = config;

  const valueToSlider = (value: number) => {
    if (value <= minValue) return minSlider;
    if (value >= maxValue) return maxSlider;
    const minLog = Math.log10(minValue);
    const maxLog = Math.log10(maxValue);
    const scale = (maxLog - minLog) / (maxSlider - minSlider);
    return Math.round((Math.log10(value) - minLog) / scale) + minSlider;
  };

  const sliderToValue = (slider: number) => {
    if (slider <= minSlider) return minValue;
    if (slider >= maxSlider) return maxValue;
    const minLog = Math.log10(minValue);
    const maxLog = Math.log10(maxValue);
    const scale = (maxLog - minLog) / (maxSlider - minSlider);
    return Math.pow(10, minLog + ((slider - minSlider) * scale));
  };

  return { valueToSlider, sliderToValue };
};

// Create specific handlers for each type of slider
const populationHandlers = createLogSliderHandlers({
  minValue: 1e3,  // 1 million
  maxValue: 1e10, // 10 billion
});

const probabilityHandlers = createLogSliderHandlers({
  minValue: 0.001, // 0.1%
  maxValue: 1,     // 100%
});

const mortalityHandlers = createLogSliderHandlers({
  minValue: 0.0001, // 0.01%
  maxValue: 1,      // 100%
});

const economicHandlers = createLogSliderHandlers({
  minValue: 1e9,    // $1 billion
  maxValue: 1e13,   // $10 trillion
});

// Export the conversion functions
export const sliderToPopulation = populationHandlers.sliderToValue;
export const probabilityToSlider = probabilityHandlers.valueToSlider;
export const sliderToProbability = probabilityHandlers.sliderToValue;
export const mortalityToSlider = mortalityHandlers.valueToSlider;
export const sliderToMortality = mortalityHandlers.sliderToValue;
export const sliderToEconomic = economicHandlers.sliderToValue; 