import { LanguageSelector } from '../../components/Utils/inputs';
import LoginForm from './LoginForm';
import LoginLogica from './LoginLogica';
import PasswordFormLogic from '../profile/passwordFormLogic';
import { useParams } from 'react-router-dom';

const LoginBoxed = () => {
    const { '*': code } = useParams();
    const isRecovering = !!code;
    const { email, setEmail, password, setPassword, submitForm, error } = LoginLogica();

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <div className="relative w-full max-w-[870px] rounded-md p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-20">
                        <div className="absolute top-10 right-20 z-10">
                            <LanguageSelector />
                        </div>
                        {isRecovering ? (
                            <>
                                <PasswordFormLogic code={code} />
                            </>
                        ) : (
                            <LoginForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} onSubmit={submitForm} error={error} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginBoxed;
