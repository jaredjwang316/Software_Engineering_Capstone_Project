import type { PageServerLoad } from './$types';
import type { UUID, User, Course, Assignment, StudentAssignment } from '$lib/types';
import { error } from '@sveltejs/kit';

type StudentAssignmentData = {
    id: UUID,
    first_name: UUID,
    last_name: UUID,
    username: UUID,
    student_assignment_id: UUID, 
    grade: number
}

export const load = (async ({parent, params, locals: { safeQuery, permCheck }}) => {
    const {user, course} = await parent();

    if(!user)
        throw error(403, {message: 'Forbidden'});

    const {data: viewAssignments, error: viewAssignmentsErr} = await permCheck('view_course_student_assignments', course.course_id);

    if(viewAssignmentsErr){
        console.error('ERROR: Database failed to check if user has permission view all student assignments:', viewAssignmentsErr);
        error(500, {message: 'Database failed to check if user has permission view all student assignments'})
    }

    if(!viewAssignments.access)
        throw error(403, {message: 'Forbidden'});

    const {data: editAssignment, error: err} = await safeQuery<StudentAssignment>("SELECT * FROM student_assignments WHERE assignment_id=$1 AND edit=true", [params.assignment]);
    if(err){
        console.error('ERROR: Database failed to query student assignments for assignment:', err);
        error(500, {message: 'Database failed to query student assignments for assignment'})
    }
    // get data of students
    const {data: students, error: studentErr} = await safeQuery<StudentAssignmentData>(
        "SELECT users.user_id AS student_id, \
                users.first_name, \
                users.last_name, \
                users.username, \
                student_assignments.student_assignment_id, student_assignments.grade \
        FROM users \
        INNER JOIN student_assignments ON users.user_id = student_assignments.student_id \
        WHERE student_assignments.assignment_id = $1",
    [params.assignment]);

    if(studentErr){
        console.error('ERROR: Database failed to query student data for their assignment:', err);
        error(500, {message: 'Database failed to query student data for their assignment'})
    }

    if(!editAssignment){
        // hopefully this doesn't happen
        console.error('ERROR: Assignment missing edit student assignment entry.');
    }

    return {
        students,
        edit: editAssignment![0]
    };
        
}) satisfies PageServerLoad;
