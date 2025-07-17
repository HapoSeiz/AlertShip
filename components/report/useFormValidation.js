import { useState } from "react";

export default function useFormValidation(formData) {
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.issue.description?.trim()) {
      errors.description = "Description is required";
    }
    if (!formData.location.locality?.trim()) {
      errors.locality = "Locality is required";
    }
    if (!formData.location.city?.trim()) {
      errors.city = "City is required";
    }
    if (!formData.location.state?.trim()) {
      errors.state = "State is required";
    }
    if (!formData.location.pinCode?.trim()) {
      errors.pinCode = "Pin code is required";
    } else if (!/^\d{6}$/.test(formData.location.pinCode)) {
      errors.pinCode = "Please enter a valid 6-digit pin code";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return { formErrors, setFormErrors, validate };
}
