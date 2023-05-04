import { UploadFile } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import React, { useRef } from 'react';

function UploadFileBtn({ onChange, value, label = 'Upload' }) {
	const fileUploadRef = useRef();
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
}

export default UploadFileBtn;
