import { useState } from 'react'

const useConfirm = () => {
    const defaultProps = { isActive: false, title: '', body: '' }
    const [confirmProps, setConfirmProps] = useState(defaultProps)
    const invoke = (title, body, labels) => {
        const acceptLabel = labels[0]
        const cancelLabel = labels[1]
        return new Promise((resolve, reject) => {
            const handleCancel = () => {
                resolve(false)
                setConfirmProps({ isActive: false })
            }
            const handleAccept = () => {
                resolve(true)
                setConfirmProps({ isActive: false })
            }

            setConfirmProps({
                isActive: true,
                title,
                body,
                acceptLabel,
                cancelLabel,
                handleAccept,
                handleCancel
            })
        })
    }
    return [invoke, confirmProps]
}

export default useConfirm
