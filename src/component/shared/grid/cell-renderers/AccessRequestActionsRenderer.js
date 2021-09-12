import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import { updateAccessRequest } from '../../../../service/access-request.service';
import { accessRequestActionsRendererStyles } from '../../../../styles/AccessRequestActionsRenderer.style';
import { updateNotificationState } from '../../../../state-management/actions/Notification.actions';

const colors = {
    Opened: 'violet',
    Approved: 'green',
    Rejected: 'red',
    Closed: 'grey'
}

function AccessRequestActionsRenderer(params) {

    const styles = accessRequestActionsRendererStyles();

    const dispatch = useDispatch();

    const [loading, setLoading] = useState({
        state: false,
        color: 'green'
    });
    const [allowedActions, setAllowedActions] = useState([]);

    const user = useSelector(state => state.auth);

    useEffect(() => {
        const id = user.user._id;
        const status = params.data.status;
        let actions = [];
        if (!(['Approved', 'Rejected'].includes(status))) {
            if (id === params.data.applicant) {
                actions = ['Open', 'Closed'];
            } else if (id === params.data.project.owner) {
                if (status === 'Closed')
                actions = ['Open'];
                else
                actions = ['Open', 'Closed', 'Approved', 'Rejected'];
            }
            actions = actions.filter(action => action !== status);
        }
        setAllowedActions(actions);
    }, [user, params]);

    const handleAction = async (action) => {
        setLoading({
            state: true,
            color: colors[action]
        });
        const { data, error } = await updateAccessRequest(params.data._id, {
            status: action
        }, user.token);
        if (error) {
            dispatch(updateNotificationState({
                isOpen: true,
                message: 'Action Failed, Please Try Again !',
                type: 'error'
            }));
        } else {
            dispatch(updateNotificationState({
                isOpen: true,
                message: `Request ${action === 'Open' ? 'Reopened' : action} successfully !`,
                type: 'success'
            }));
        }
        setLoading({
            ...loading,
            state: false
        });
    }

    const isAllowed = (action) => {
        return allowedActions.includes(action);
    }

    return (
        <div className={styles.root}>
            {
                !loading.state ?
                    <>
                        {
                            isAllowed('Open') ?
                                <Tooltip
                                    title="Reopen"
                                    arrow
                                >
                                    <IconButton
                                        onClick={() => handleAction('Open')}
                                    >
                                        <LockOpenIcon 
                                            style={{ color: colors.Opened }}
                                        />
                                    </IconButton>
                                </Tooltip> : ''
                        }
                        {
                            isAllowed('Approved') ?
                                <Tooltip
                                    title="Approve"
                                    arrow
                                >
                                    <IconButton
                                        onClick={() => handleAction('Approved')}
                                    >
                                        <TaskAltIcon 
                                            style={{ color: colors.Approved }}
                                        />
                                    </IconButton>
                                </Tooltip> : ''
                        }
                        {
                            isAllowed('Rejected') ?
                                <Tooltip
                                    title="Reject"
                                    arrow
                                >
                                    <IconButton
                                        onClick={() => handleAction('Rejected')}
                                    >
                                        <CancelOutlinedIcon 
                                            style={{ color: colors.Rejected }}
                                        />
                                    </IconButton>
                                </Tooltip> : ''
                        }
                        {
                            isAllowed('Closed') ?
                                <Tooltip
                                    title="Close"
                                    arrow
                                >
                                    <IconButton
                                        onClick={() => handleAction('Closed')}
                                    >
                                        <LockOutlinedIcon 
                                            style={{ color: colors.Closed }}
                                        />
                                    </IconButton>
                                </Tooltip> : ''
                        }
                    </>
                    : <CircularProgress 
                        size={20}
                        style={{ color: loading.color}}
                        className={styles.circularProgress}
                        />
            }
        </div>
    )
}

export default AccessRequestActionsRenderer;