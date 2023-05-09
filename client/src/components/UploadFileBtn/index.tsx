import { UploadFile } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import React, { ChangeEventHandler, useRef } from 'react';

interface UploadFileBtnProps {
	onChange: ChangeEventHandler<HTMLInputElement>;
	value: File | null;
	label?: string;
}

const UploadFileBtn: React.FC<UploadFileBtnProps> = ({
	onChange,
	value,
	label = 'Upload',
}) => {
	const fileUploadRef = useRef<HTMLInputElement | null>(null);
	return (
		<>
			<Stack direction="row" gap={2} alignItems="center">
				<Button
					variant="outlined"
					size="large"
					startIcon={<UploadFile />}
					sx={{
						alignSelf: 'flex-start',
					}}
					onClick={() => {
						if (fileUploadRef.current) fileUploadRef.current.click();
					}}
				>
					{label}
				</Button>
				<Typography fontStyle="italic">
					{value ? `Selected File: ${value.name}` : 'No File Selected'}
				</Typography>
			</Stack>
			<input
				ref={fileUploadRef}
				type="file"
				name="document"
				hidden
				accept="application/pdf"
				onChange={onChange}
			/>
		</>
	);
};

export default UploadFileBtn;
