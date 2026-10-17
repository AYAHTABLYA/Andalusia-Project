import type { loginFormType } from "../../Types/loginFormType.ts";
import { HTTPS_STATUS_OKAY } from "./constants.ts";
import axios from "../../apis/axios.ts";
import urls from "../../apis/urls.json";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function useLoginUser(
  submittedClicked: any,
  setSubmittedClicked: any,
  formData: loginFormType,
) {
  const loginUserEndpoint = urls.loginUser;
  const user = localStorage.getItem("user");
  const navigate = useNavigate();

  useEffect(() => {
    const loginUser = async () => {
      const response = await axios.post(loginUserEndpoint, {
        email: formData.email,
        password: formData.password,
      });
      console.log(response);

      if (response.status === HTTPS_STATUS_OKAY) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("access_token", response.data.token);
        navigate("/");
      }

      setSubmittedClicked(false);
    };

    if (user) {
      navigate("/");
    }

    if (submittedClicked) {
      loginUser();
    }
  }, [submittedClicked]);
}

export default useLoginUser;
