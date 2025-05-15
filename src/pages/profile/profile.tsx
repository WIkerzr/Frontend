import 'tippy.js/dist/tippy.css';

import PasswordFormLogic from './passwordFormLogic';
import FormUserDateLogic from './userDateFormLogic';

const Index = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormUserDateLogic />
            <PasswordFormLogic />
        </div>
    );
};

export default Index;
