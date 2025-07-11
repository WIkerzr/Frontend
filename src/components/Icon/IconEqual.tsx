import { FC } from 'react';

interface IconEqualProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconEqual: FC<IconEqualProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path d="M5 9H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M5 15H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5 8.25C5 7.83579 5.33579 7.5 5.75 7.5H18.25C18.6642 7.5 19 7.83579 19 8.25C19 8.66421 18.6642 9 18.25 9H5.75C5.33579 9 5 8.66421 5 8.25Z"
                        fill="currentColor"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5 14.25C5 13.8358 5.33579 13.5 5.75 13.5H18.25C18.6642 13.5 19 13.8358 19 14.25C19 14.6642 18.6642 15 18.25 15H5.75C5.33579 15 5 14.6642 5 14.25Z"
                        fill="currentColor"
                    />
                </svg>
            )}
        </>
    );
};

export default IconEqual;
