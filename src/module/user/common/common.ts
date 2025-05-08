import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from '../userDTO/updateUserDTO';

export async function prepareUpdateFields(updateData: UpdateUserDTO, userId: number) {
    
    const { email, password, mobileNo, roleId, businessName, businessRepresentative, vendorCode, address } = updateData;

    const fields = [];
    const values = [];
    const updatedBy = userId;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    if (email) {
        fields.push("email = ?");
        values.push(email);
    }
    if (hashedPassword) {
        fields.push("password = ?");
        values.push(hashedPassword);
    }
    if (mobileNo) {
        fields.push("mobileNo = ?");
        values.push(mobileNo);
    }
    if (roleId) {
        fields.push("roleId = ?");
        values.push(roleId);
    }
    if (businessName) {
        fields.push("businessName = ?");
        values.push(businessName);
    }
    if (businessRepresentative) {
        fields.push("businessRepresentative = ?");
        values.push(businessRepresentative);
    }
    if (vendorCode) {
        fields.push("vendorCode = ?");
        values.push(vendorCode);
    }
    if (address) {
        fields.push("address = ?");
        values.push(address);
    }
    fields.push("updatedBy = ?", "updatedAt = NOW()");
    values.push(updatedBy);

    return {
        isEmpty: fields.length === 0,
        fields: fields,
        values: values
    };
}
