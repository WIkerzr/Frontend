import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    children: ReactNode;
}

export function NewModal({ open, onClose, title, children }: ModalProps) {
    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" open={open} onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0" />
                </Transition.Child>
                <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg my-8 text-black dark:text-white-dark">
                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                    <h5 className="font-bold text-lg">{title}</h5>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path d="M6 6l12 12M18 6L6 18" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-5">{children}</div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
