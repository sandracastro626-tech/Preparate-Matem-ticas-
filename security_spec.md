# Security Specification - CHECK-ICFES

## Data Invariants
- A question must belong to a valid components/competence.
- A simulacro must have at least one question.
- An attempt must be linked to a valid simulacro and a valid student.
- Roles (admin, docente, estudiante) define the vertical access patterns.

## The Dirty Dozen Payloads
1. **Identity Spoofing**: Attempt to create a user profile with `rol: 'administrador'` as a normal user.
2. **PII Leak**: A student attempting to read the full profile list including other students' emails.
3. **State Corruption**: An unauthorized user trying to delete a question from the bank.
4. **Outcome Manipulation**: A student trying to update their own `puntaje` in an attempt document.
5. **Orphaned Write**: Creating an attempt for a non-existent `simulacroId`.
6. **Escalation**: A docente trying to upgrade their own role to `administrador`.
7. **Ghost Field**: Adding `isVerified: true` to a user profile during creation.
8. **Resource Exhaustion**: Sending a 1MB string as a question ID.
9. **Timestamp Spoofing**: Setting a 2030 `fechaCreacion` from the client.
10. **Role Bypass**: A student trying to create a `simulacro`.
11. **Cross-Tenant Access**: A user reading a simulacro assigned to another institution/group they don't belong to.
12. **System Injection**: Modifying the `creadoPor` field on a question they didn't create.

## Test Strategy
- Verify that only authorized roles can write to specific collections.
- Verify that users can only read PII they own or have admin access to.
- Verify strict schema validation for all writes.
