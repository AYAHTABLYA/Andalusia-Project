import type { registerFormType } from "../../Types/registerFormType.ts";
import { HTTPS_STATUS_OKAY } from "./constants.ts";
import urls from "../../apis/urls.json";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function useRegisterUser(
  submittedClicked: any,
  setSubmittedClicked: any,
  formData: registerFormType,
) {
  const registerUserEndpoint = urls.auth.register;
  const user = localStorage.getItem("user");
  const navigate = useNavigate();

  useEffect(() => {
    const registerUser = async () => {
      const response = await axios.post(registerUserEndpoint, {
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });
      console.log(response);

      if (response.status === HTTPS_STATUS_OKAY) {
        navigate("/login");
      }

      setSubmittedClicked(false);
    };

    if (user) {
      navigate("/");
    }
    if (submittedClicked) {
      registerUser();
    }
  }, [submittedClicked]);
}

export default useRegisterUser;
