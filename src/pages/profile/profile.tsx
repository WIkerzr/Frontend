import 'tippy.js/dist/tippy.css';

import PasswordFormLogic from './passwordFormLogic';
import UserDateFormLogic from './userDateFormLogic';

const Index = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserDateFormLogic />
            <PasswordFormLogic />
        </div>
    );
};

export default Index;
