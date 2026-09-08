from datetime import datetime
from typing import List
from ..types.schemas import ExperienceLetterData, FieldValidation, ValidationResult

def validate_experience_data(data: ExperienceLetterData) -> ValidationResult:
    checks: List[FieldValidation] = []
    
    # 1. Employee Name
    if data.employee_name and data.employee_name.strip():
        checks.append(FieldValidation(
            field='employee_name',
            label='Employee Name',
            status='pass',
            message='Valid employee name identified.',
            value=data.employee_name
        ))
    else:
        checks.append(FieldValidation(
            field='employee_name',
            label='Employee Name',
            status='fail',
            message='Employee name is missing from document.',
            value=None
        ))

    # 2. Company Name
    if data.company_name and data.company_name.strip():
        checks.append(FieldValidation(
            field='company_name',
            label='Company Name',
            status='pass',
            message='Valid employing organization identified.',
            value=data.company_name
        ))
    else:
        checks.append(FieldValidation(
            field='company_name',
            label='Company Name',
            status='fail',
            message='Employing company name is missing.',
            value=None
        ))

    # 3. Designation / Role
    if data.designation and data.designation.strip():
        checks.append(FieldValidation(
            field='designation',
            label='Designation / Role',
            status='pass',
            message='Designation is present.',
            value=data.designation
        ))
    else:
        checks.append(FieldValidation(
            field='designation',
            label='Designation / Role',
            status='warning',
            message='Designation not explicitly found; human verification recommended.',
            value=None
        ))

    # 4. Joining Date
    jd_valid = False
    jd_dt = None
    if data.joining_date:
        try:
            jd_dt = datetime.fromisoformat(data.joining_date)
            jd_valid = True
            checks.append(FieldValidation(
                field='joining_date',
                label='Joining Date',
                status='pass',
                message=f'Valid ISO date: {data.joining_date}',
                value=data.joining_date
            ))
        except Exception:
            checks.append(FieldValidation(
                field='joining_date',
                label='Joining Date',
                status='fail',
                message=f'Invalid date format: {data.joining_date}',
                value=data.joining_date
            ))
    else:
        checks.append(FieldValidation(
            field='joining_date',
            label='Joining Date',
            status='warning',
            message='Joining date not found in letter. Manual review recommended.',
            value=None
        ))

    # 5. Last Working Date
    lwd_valid = False
    lwd_dt = None
    if data.last_working_date:
        try:
            lwd_dt = datetime.fromisoformat(data.last_working_date)
            lwd_valid = True
            checks.append(FieldValidation(
                field='last_working_date',
                label='Last Working Date',
                status='pass',
                message=f'Valid ISO date: {data.last_working_date}',
                value=data.last_working_date
            ))
        except Exception:
            checks.append(FieldValidation(
                field='last_working_date',
                label='Last Working Date',
                status='fail',
                message=f'Invalid date format: {data.last_working_date}',
                value=data.last_working_date
            ))
    else:
        checks.append(FieldValidation(
            field='last_working_date',
            label='Last Working Date',
            status='warning',
            message='Last working date not found. Manual review recommended.',
            value=None
        ))

    # 6. Date Order Validation
    if jd_valid and lwd_valid and jd_dt and lwd_dt:
        if jd_dt < lwd_dt:
            checks.append(FieldValidation(
                field='date_order',
                label='Employment Timeline Consistency',
                status='pass',
                message=f'Chronology verified: Joining Date precedes Last Working Date.',
                value=f'{data.joining_date} -> {data.last_working_date}'
            ))
        else:
            checks.append(FieldValidation(
                field='date_order',
                label='Employment Timeline Consistency',
                status='fail',
                message='Timeline conflict: Joining date is on or after last working date.',
                value=f'{data.joining_date} >= {data.last_working_date}'
            ))

    # 7. Signatory verification
    if data.signatory_name:
        sig_info = data.signatory_name
        if data.signatory_designation:
            sig_info += f' ({data.signatory_designation})'
        checks.append(FieldValidation(
            field='signatory_name',
            label='Signatory / Authority',
            status='pass',
            message=f'Signed by {sig_info}',
            value=data.signatory_name
        ))
    else:
        checks.append(FieldValidation(
            field='signatory_name',
            label='Signatory / Authority',
            status='warning',
            message='No explicit signatory name recognized on document.',
            value=None
        ))

    pass_count = sum(1 for c in checks if c.status == 'pass')
    warn_count = sum(1 for c in checks if c.status == 'warning')
    fail_count = sum(1 for c in checks if c.status == 'fail')

    overall = 'PASS' if fail_count == 0 and warn_count == 0 else ('FAIL' if fail_count > 0 else 'WARNING')
    is_valid = fail_count == 0

    return ValidationResult(
        is_valid=is_valid,
        overall_status=overall,
        passed_count=pass_count,
        warning_count=warn_count,
        fail_count=fail_count,
        checks=checks
    )
