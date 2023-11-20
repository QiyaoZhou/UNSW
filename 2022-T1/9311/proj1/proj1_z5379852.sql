-- comp9311 22T1 Project 1
--
-- MyMyUNSW Solutions


-- Q1:
create or replace view Q1(subject_name)
as
--... SQL statements, possibly using other views/functions defined by you ...
select name as subject_name from subjects
where length(_prereq)-length(replace(_prereq,'COMP',''))>=8
and length(_prereq)-length(replace(_prereq,'COMP3',''))>=5;

-- Q2:
create or replace view Q2(course_id)
as
--... SQL statements, possibly using other views/functions defined by you ...
select a.course_id from
(select courses.id as course_id,count(distinct(rooms.building)) as bu_num from ((courses inner join classes on courses.id=classes.course)
inner join rooms on classes.room=rooms.id)
inner join class_types on classes.ctype=class_types.id
where class_types.name='Studio'
group by courses.id) as a
where a.bu_num>=3;

-- Q3:
create or replace view Q3(course_id, use_rate)
as 
--... SQL statements, possibly using other views/functions defined by you ...
select a.cid as course_id,a.ur as user_rate from(
    select courses.id as cid,count(classes.id) as ur from (
        (courses inner join classes on courses.id=classes.course)
        inner join rooms on classes.room=rooms.id)
        inner join buildings on buildings.id=rooms.building
        where buildings.name='Central Lecture Block'
        and classes.startdate>='2008-1-1'
        and classes.enddate<'2009-1-1'
        group by courses.id) as a
where a.ur = (
    select max(b.ur) from (
        select courses.id as cid,count(classes.id) as ur from ((courses inner join classes on courses.id=classes.course)
        inner join rooms on classes.room=rooms.id)
        inner join buildings on buildings.id=rooms.building
        where buildings.name='Central Lecture Block'
        and classes.startdate>='2008-1-1'
        and classes.enddate<'2009-1-1'
        group by courses.id) as b);

-- Q4:
create or replace view Q4(facility)
as
--... SQL statements, possibly using other views/functions defined by you ...
select description as facility
from facilities
except select distinct facilities.description from((
    facilities inner join room_facilities on facilities.id=room_facilities.facility)
    inner join rooms on room_facilities.room=rooms.id)
    inner join buildings on rooms.building=buildings.id
    where buildings.campus='K'
    and buildings.gridref like 'C%';

--Q5:
create or replace view Q5(unsw_id, student_name)
as
--... SQL statements, possibly using other views/functions defined by you ...
select people.unswid as unsw_id, people.name as student_name
from people inner join students on people.id=students.id
except select distinct people.unswid,people.name from (
    people inner join course_enrolments on people.id=course_enrolments.student)
inner join students on people.id=students.id
where course_enrolments.grade != 'HD' or students.stype='intl';

-- Q6:
create or replace view Q6(subject_name, non_null_mark_count, null_mark_count)
as
--... SQL statements, possibly using other views/functions defined by you ...
select a.subject_name as subject_name,a.non_null_mark_count as non_null_mark_count,
a.null_mark_count as null_mark_count
from(select subjects.id as subject_id,subjects.name as subject_name,count(course_enrolments.mark) as non_null_mark_count,
count(*)-count(course_enrolments.mark) as null_mark_count
from ((subjects inner join courses on subjects.id=courses.subject)
inner join course_enrolments on course_enrolments.course=courses.id)
inner join semesters on semesters.id=courses.semester
where semesters.year=2006,semesters.term='S1'
group by subjects.id
having count(course_enrolments.mark)>=1 and count(*)-count(course_enrolments.mark)>10) as a;

-- Q7:
create or replace view Q7(school_name, stream_count)
as
--... SQL statements, possibly using other views/functions defined by you ...
select orgunits.longname as school_name,count(streams.id) as stream_count
from orgunits inner join streams on orgunits.id=streams.offeredby
where orgunits.longname like 'School%'
group by orgunits.longname
having count(streams.id)>(select count(streams.id) from orgunits inner join streams on orgunits.id=streams.offeredby
where orgunits.longname='School of Computer Science and Engineering'
group by orgunits.longname);

-- Q8: 
create or replace view Q8(student_name_local, student_name_intl)
as
--... SQL statements, possibly using other views/functions defined by you ...
select a.name as student_name_local,b.name as student_name_intl
from (select people.name as name,course_enrolments.mark as mark
from ((((people inner join students on people.id=students.id)
inner join course_enrolments on course_enrolments.student=people.id)
inner join courses on course_enrolments.course=courses.id)
inner join semesters on courses.semester=semesters.id)
inner join subjects on courses.subject=subjects.id
where semesters.year= 2012 and semesters.term= 'S1' 
and course_enrolments.mark>98 and students.stype='local' and subjects.name='Engineering Design') as a 
inner join (select people.name as name,course_enrolments.mark as mark
from ((((people inner join students on people.id=students.id)
inner join course_enrolments on course_enrolments.student=people.id)
inner join courses on course_enrolments.course=courses.id)
inner join semesters on courses.semester=semesters.id)
inner join subjects on courses.subject=subjects.id
where semesters.year= 2012 and semesters.term= 'S1' 
and course_enrolments.mark>98 and students.stype='intl' and subjects.name='Engineering Design') as b on a.mark=b.mark;

-- Q9:
create or replace view Q9(ranking, course_id, subject_name, student_diversity_score)
as
--... SQL statements, possibly using other views/functions defined by you ...
select a.ranking as ranking,a.courseid as course_id,b.subject_name as subject_name,a.student_diversity_score as student_diversity_score
from(select rank()over(order by temp.score desc) as ranking,temp.id as courseid,temp.score as student_diversity_score
from (select courses.id as id,count(distinct(people.origin)) as score
from (courses inner join course_enrolments on course_enrolments.course=courses.id)
inner join people on course_enrolments.student=people.id
group by courses.id) as temp) as a 
inner join (select subjects.name as subject_name,courses.id as courseid
from subjects inner join courses on subjects.id=courses.subject) as b on a.courseid=b.courseid
where a.ranking<=6;

-- Q10:
create or replace view Q10(subject_code, avg_mark)
as
--... SQL statements, possibly using other views/functions defined by you ...
select a.subject_code as subject_code,a.avg_mark as avg_mark
from (select subjects.code as subject_code,round(avg(coalesce(course_enrolments.mark,0)),2) as avg_mark,
count(course_enrolments.student) as std_num
from (((subjects inner join courses on subjects.id=courses.subject)
inner join course_enrolments on course_enrolments.course=courses.id)
inner join orgunits on orgunits.id=subjects.offeredby)
inner join semesters on semesters.id=courses.semester
where subjects.career='PG' and orgunits.longname='School of Computer Science and Engineering'
and semesters.year=2010 and semesters.term='S1'
group by subjects.code
order by round(avg(coalesce(course_enrolments.mark,0)),2) desc) as a
where a.std_num>10;

-- Q11:
create or replace view Q11(subject_code, inc_rate)
as
--... SQL statements, possibly using other views/functions defined by you ...
select a.code as subject_code,round((b.mark-a.mark)/a.mark,4) as inc_rate
from (select subjects.code as code,avg(course_enrolments.mark) as mark
from (((subjects inner join courses on subjects.id=courses.subject)
inner join course_enrolments on course_enrolments.course=courses.id)
inner join orgunits on orgunits.id=subjects.offeredby)
inner join semesters on semesters.id=courses.semester
where semesters.year=2008 and semesters.term='S1' and (orgunits.longname='School of Chemistry' or orgunits.longname='School of Accounting' )
group by code) as a
inner join (select subjects.code as code,avg(course_enrolments.mark) as mark
from (((subjects inner join courses on subjects.id=courses.subject)
inner join course_enrolments on course_enrolments.course=courses.id)
inner join orgunits on orgunits.id=subjects.offeredby)
inner join semesters on semesters.id=courses.semester
where semesters.year=2008 and semesters.term='S2' and (orgunits.longname='School of Chemistry' or orgunits.longname='School of Accounting' )
group by code) as b on a.code=b.code
where round((b.mark-a.mark)/a.mark,4) = (select max(round((d.mark-c.mark)/c.mark,4))
from (select subjects.code as code,avg(course_enrolments.mark) as mark
from (((subjects inner join courses on subjects.id=courses.subject)
inner join course_enrolments on course_enrolments.course=courses.id)
inner join orgunits on orgunits.id=subjects.offeredby)
inner join semesters on semesters.id=courses.semester
where semesters.year=2008 and semesters.term='S1' and (orgunits.longname='School of Chemistry' or orgunits.longname='School of Accounting' )
group by code) as c
inner join (select subjects.code as code,avg(course_enrolments.mark) as mark
from (((subjects inner join courses on subjects.id=courses.subject)
inner join course_enrolments on course_enrolments.course=courses.id)
inner join orgunits on orgunits.id=subjects.offeredby)
inner join semesters on semesters.id=courses.semester
where semesters.year=2008 and semesters.term='S2' and (orgunits.longname='School of Chemistry' or orgunits.longname='School of Accounting' )
group by code) as d on c.code=d.code);

-- Q12:
create or replace view Q12(name, subject_code, year, term, lab_time_per_week)
as
--... SQL statements, possibly using other views/functions defined by you ...
select people.name as name,subjects.code as subject_code,semesters.year as year,semesters.term as term,
(classes.endtime-classes.starttime)*classes.dayofwk as lab_time_per_week
from((((((class_types inner join classes on class_types.id=classes.ctype)
inner join courses on classes.course=courses.id)
inner join course_staff on courses.id=course_staff.course)
inner join people on people.id=course_staff.staff)
inner join semesters on semesters.id=courses.semester)
inner join staff_roles on staff_roles.id=course_staff.role)
inner join subjects on subjects.id=courses.subject
where class_types.unswid='LAB' and people.title='Dr' and subjects.code like 'COMP%' 
and position('Lecturer' in staff_roles.name)!=0;

-- Q13:
create or replace view Q13(subject_code, year, term, fail_rate)
as
--... SQL statements, possibly using other views/functions defined by you ...
select b.code as subject_code,b.year as year,b.term as term,b.f_rate as fail_rate
from (select row_number()over(partition by subjects.code order by a.std_num desc) as order_in_student,
subjects.code as code,semesters.year as year,semesters.term as term, a.fail_rate as f_rate
from((((select courses.id as cid,
(case when count(course_enrolments.mark)=0 then 0 else round(sum(case when course_enrolments.mark<50 then 1 else 0 end)::numeric/count(course_enrolments.mark)::numeric,4) end) as fail_rate,
count(course_enrolments.student) as std_num
from courses inner join course_enrolments on courses.id=course_enrolments.course
group by courses.id) as a
inner join courses on courses.id=a.cid)
inner join subjects on subjects.id=courses.subject)
inner join course_enrolments on course_enrolments.course=courses.id)
inner join semesters on semesters.id=courses.semester
where subjects.code like 'COMP%' and a.std_num>150) as b
where b.order_in_student<2;