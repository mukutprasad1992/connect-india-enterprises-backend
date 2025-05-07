export const userLoginWasSuccessfulWelcomeBack = "User login was successful. Welcome back.";
export const anErrorOccurredDuringTheAccessTokenUpdate = "An error occurred during the access token update.";
export const anErrorOccurredDuringLoginPleaseTryAgain = "An error occurred during login. Please try again.";
export const anErrorOccurredWhileLoggingInTheUser = "An error occurred while logging in the user.";
export const invalidEmailOrPassword = "Invalid email or password.";
export const inCurrectOldPassword = "Incurrect old password.";
export const passwordChangedSuccessfully = "Password changed successfully.";
export const anErrorOccurredWhileChangingYourPassword = "An error occurred while changing your password.";
export const anErrorOccurredWhileSendingResetEmail = "An error occurred while sending reset email.";
export const passwordResetRequest = "Password Reset Request";
export const pleaseClickTheFollowingLinkToResetYourPassword = "Please click the following link to reset your password:";
export const resetPassword = "Reset Password";
export const passwordResetEmailSentSuccessfully = "Password reset email sent successfully.";
export const emailNotFound = "User with this email does not exist.";
export const invalidOrExpiredResetToken = "Invalid or expired reset token.";
export const userIdNotFound = "User Id not found.";
export const userFound = "User found.";
export const anErrorOccurredWhileCheckingTheUser = "An error occurred while checking the user.";
export const emailIdExist = "Email Id found.";
export const passwordResetSuccessfully = "Password reset successfully.";
export const noUserFoundWithTheProvidedIDOrNoChangesHaveBeenMade = "No user found with the provided ID, or no changes have been made.";
export const anErrorOccurredWhileUpdatingThePassword = "An error occurred while updating the password";
export const yourLinkHasExpiredPleaseRegenerateTheLinkToProceed = "Your link has expired. Please regenerate the link to proceed.";
export const inputCannotBeUndefinedOrNull = "Input cannot be undefined or null";
export const pleaseProvideAValidEmailAddress = "Please provide a valid email address";
export const passwordMustBeAtLeast6CharactersLong = "Password must be at least 6 characters long";
export const isRequired = "is required";
export const mustBeAValidEmail = "must be a valid email";
export const mustBeAtLeast = "must be at least";
export const mustNotExceed = "must not exceed";
export const failsToMatchTheRequiredPattern = "fails to match the required pattern";
export const yourAccountIsBlockedPleaseContactTheAdminToActivateYourAccount = "Your account is blocked. Please contact the admin to activate your account.";
export const resetTokenNotSaved = "Reset token not saved";
export const failedToSendResetEmail = "Failed to send reset email";

export const AuthValidationMessages = {
    email: {
        required: "Email is required",
        email: "Email should be a valid email address",
    },
    password: {
        required: "Password is required",
        min: "Password must be at least 6 characters long",
        max: "Password must not exceed 20 characters",
        pattern: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    },
    oldPassword: {
        required: "Old password is required",
        min: "Old password must be at least 6 characters long",
        max: "Old password must not exceed 20 characters",
    },
    newPassword: {
        required: "New password is required",
        min: "New password must be at least 6 characters long",
        max: "New password must not exceed 20 characters",
        pattern: "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    },
    token: {
        required: "Token is required",
        invalid: "Token is invalid or has expired",
    },
};

