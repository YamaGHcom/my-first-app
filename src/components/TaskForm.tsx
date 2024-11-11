"use client"

import { useFormState } from 'react-dom'
import { createTask, editTask } from '../actions/taskController';

type TaskFormProps = {
    action: "create" | "edit";
    task?: {
        _id: string;
        task: string
    }
}

export default function TaskForm(props: TaskFormProps) {
    let actualAction: typeof createTask | typeof editTask;

    if (props.action === "create") {
        actualAction = createTask;
    } else if (props.action === "edit") {
        actualAction = editTask;
    } else {
        throw new Error("Invalid action type");
    }

    const [formState, formAction] = useFormState(actualAction, { errors: {} });

    return (
        <form action={formAction} className="max-w-xs mx-auto">
            <div className="mb-3">
                <input name="line1" defaultValue={props.task?.task} autoComplete="off" type="text" placeholder="line #1" className="input input-bordered w-full max-w-xs" />
                {formState.errors?.task && (
                    <div role="alert" className="alert alert-warning">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 shrink-0 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{formState.errors?.task}</span>
                    </div>
                )}
            </div>
            <input type="hidden" name="taskId" defaultValue={props.task?._id.toString()} />
            <button className='btn btn-secondary'>Submit</button>
        </form>
    )
}