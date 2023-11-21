import sys
from collections import defaultdict
from cspConsistency import Search_with_AC_from_CSP
from cspProblem import CSP, Constraint
from searchGeneric import AStarSearcher

# Introduction: This job modified some code in AIPYTHON,
# including commenting out the display code that affected
# the output and making minor changes to the arc consistency
# method and any_holds method


# Extend from class CSP.Holds methods are defined to pass
# in the duration of activities in the class for arc consistency
# processing of binary constraints
class ExtendedCSP(CSP):
    def __init__(self, domains, constraints, activities):
        self.variables = set(domains)
        self.domains = domains
        self.constraints = constraints
        self.activities = activities
        self.var_to_const = {var: set() for var in self.variables}
        for con in constraints:
            for var in con.scope:
                self.var_to_const[var].add(con)

    def holds(self, const, env):
        h_list = [env[v] for v in const.scope]
        if const.condition == before:
            h_list.append(self.activities[const.scope[0]]['duration'])
            return const.condition(*tuple(h_list))
        elif const.condition == starts or const.condition == same_day:
            return const.condition(*tuple(h_list))
        elif const.condition == after:
            h_list.append(self.activities[const.scope[1]]['duration'])
            return const.condition(*tuple(h_list))
        else:
            h_list.extend(self.activities[s]['duration'] for s in const.scope)
            return const.condition(*tuple(h_list))


# Extend from class Search_with_AC_from_CSP.
# The heuristic method is overwritten here.
class Search_with_AC_from_cost_CSP(Search_with_AC_from_CSP):
    def __init__(self, csp):
        super().__init__(csp)

    def heuristic(self, node):
        h_num = 0
        for n in node.keys():
            if node[n] != set():
                if 'soft' in csp.activities[n].keys():
                    min_num = 99999999
                    for p in list(node[n]):
                        c = abs(p % 24 - csp.activities[n]['soft'][0])
                        if c < min_num:
                            min_num = c
                    h_num = h_num + csp.activities[n]['soft'][1]*min_num
        return h_num


lines = []
for line in sys.stdin:
    lines.append(line.strip())
print(lines)

# Used to store activity duration and soft constraints
activity = defaultdict(dict)
# Used to store domain of each activity
domain_real = defaultdict(dict)
# Used to store binary constraints
constraints = []
# Used to list the conversion time format
time_list = []
for i in range(0, 7):
    for j in range(7, 20):
        time_list.append(j + i * 24)
# Used to find the start time format of the corresponding day
day_num = {'sun': 0, 'mon': 24, 'tue': 48, 'wed': 72, 'thu': 96, 'fri': 120, 'sat': 144}
# Used to convert back to the original time format
day_num_dict = {'0': 'sun', '1': 'mon', '2': 'tue', '3': 'wed', '4': 'thu', '5': 'fri', '6': 'sat'}


def time_transform(time):
    res = str(0)
    if time % 24 != 0:
        if int(time % 24) > 12:
            res = str(day_num_dict[str(time // 24)]) + " " + str((time % 24) - 12) + 'pm'
        elif int(time % 24) < 12:
            res = str(day_num_dict[str(time // 24)]) + " " + str(time % 24) + 'am'
        elif int(time % 24) == 12:
            res = str(day_num_dict[str(time // 24)]) + " " + str(time % 24) + 'pm'
    return res


# Binary constrained function
def before(x, y, x_d):
    return x + x_d <= y


def after(x, y, y_d):
    return x >= y + y_d


def starts(x, y):
    return x == y


def ends(x, y, x_d, y_d):
    return x + x_d == y + y_d


def overlaps(x, y, x_d, y_d):
    return x >= y >= x + x_d >= y + y_d


def during(x, y, x_d, y_d):
    return x >= y and x + x_d <= y + y_d


def equals(x, y, x_d, y_d):
    return x == y and x + x_d == y + y_d


def same_day(x, y):
    return x // 24 == y // 24


# Process input files to extract data
for line in lines:
    cur_list = time_list.copy()
    line = line.strip('\n')
    content = line.split(' ')
    if content[0] == '#':
        continue
    elif content[0] == 'activity':
        activity[content[1]]['duration'] = int(content[2])
        domain_real[content[1]] = set(cur_list)
    elif content[0] == 'domain' and len(content) == 5:
        if content[3][-2:] == 'pm' and content[3] != '12pm':
            activity[content[1]]['soft'] = [int(content[3][:-2])+12, int(content[4])]
        else:
            activity[content[1]]['soft'] = [int(content[3][:-2]), int(content[4])]
    elif content[0] == 'domain' and len(content) == 4:
        if content[2] == 'on':
            select_list = []
            result_list = []
            for i in range(day_num[content[3]], day_num[content[3]]+24):
                select_list.append(i)
            cur = list(domain_real[content[1]])
            for i in cur:
                for j in select_list:
                    if i == j:
                        result_list.append(i)
            domain_real[content[1]] = set(result_list)
        elif content[2] == 'before':
            select_list = []
            result_list = []
            for i in range(day_num[content[3]]):
                select_list.append(i)
            cur = list(domain_real[content[1]])
            for i in cur:
                for j in select_list:
                    if i == j:
                        result_list.append(i)
            domain_real[content[1]] = set(result_list)
        elif content[2] == 'after':
            select_list = []
            result_list = []
            for i in range(day_num[content[3]], 168):
                select_list.append(i)
            cur = list(domain_real[content[1]])
            for j in select_list:
                if j in cur:
                    result_list.append(j)
            domain_real[content[1]] = set(result_list)
        elif content[2] == 'starts-before':
            select_list = []
            result_list = []
            if content[3][-2:] == 'pm' and content[3] != '12pm':
                t = int(content[3][:-2])+12
            else:
                t = int(content[3][:-2])
            for i in range(168):
                if i % 24 <= t:
                    select_list.append(i)
            cur = list(domain_real[content[1]])
            for j in select_list:
                if j in cur:
                    result_list.append(j)
            domain_real[content[1]] = set(result_list)
        elif content[2] == 'starts-after':
            select_list = []
            result_list = []
            if content[3][-2:] == 'pm' and content[3] != '12pm':
                t = int(content[3][:-2])+12
            else:
                t = int(content[3][:-2])
            for i in range(168):
                if i % 24 >= t:
                    select_list.append(i)
            cur = list(domain_real[content[1]])
            for j in select_list:
                if j in cur:
                    result_list.append(j)
            domain_real[content[1]] = set(result_list)
        elif content[2] == 'ends-before':
            select_list = []
            result_list = []
            if content[3][-2:] == 'pm' and content[3] != '12pm':
                t = int(content[3][:-2])+12-activity[content[1]]['duration']
            else:
                t = int(content[3][:-2])-activity[content[1]]['duration']
            for i in range(168):
                if i % 24 <= t:
                    select_list.append(i)
            cur = list(domain_real[content[1]])
            for j in select_list:
                if j in cur:
                    result_list.append(j)
            domain_real[content[1]] = set(result_list)
        elif content[2] == 'ends-after':
            select_list = []
            result_list = []
            if content[3][-2:] == 'pm' and content[3] != '12pm':
                t = int(content[3][:-2])+12-activity[content[1]]['duration']
            else:
                t = int(content[3][:-2])-activity[content[1]]['duration']
            for i in range(168):
                if i % 24 >= t:
                    select_list.append(i)
            cur = list(domain_real[content[1]])
            for j in select_list:
                if j in cur:
                    result_list.append(j)
            domain_real[content[1]] = set(result_list)
    elif content[0] == 'constraint' and len(content) == 4:
        if content[2] == 'before':
            constraints.append(Constraint((content[1], content[3]), before))
        elif content[2] == 'after':
            constraints.append(Constraint((content[1], content[3]), after))
        elif content[2] == 'starts':
            constraints.append(Constraint((content[1], content[3]), starts))
        elif content[2] == 'ends':
            constraints.append(Constraint((content[1], content[3]), ends))
        elif content[2] == 'overlaps':
            constraints.append(Constraint((content[1], content[3]), overlaps))
        elif content[2] == 'during':
            constraints.append(Constraint((content[1], content[3]), during))
        elif content[2] == 'equals':
            constraints.append(Constraint((content[1], content[3]), equals))
        elif content[2] == 'same-day':
            constraints.append(Constraint((content[1], content[3]), same_day))
# print(domain_real)
# print(constraints)
# print(activity)
# The information of processing input file is passed
# into ExtendedCSP (extended from CSP), arc consistency check is performed
# with Search_with_AC_from_cost_CSP (extended from Search_with_AC_from_CSP)
# to reduce the domain, and CSP problem is obtained.
# Finally, AStar search is used to obtain the optimal solution.
csp = ExtendedCSP(domain_real, constraints, activity)
my_searcher = AStarSearcher(Search_with_AC_from_cost_CSP(csp))
solution = my_searcher.search()
# Write the solution to output

if solution:
    result = {v: list(d)[0] for (v, d) in solution.end().items()}
    for i in result.keys():
        msg = i + ":" + time_transform(result[i])
        print(msg)
    cost = 0
    for i in result.keys():
        if 'soft' in activity[i].keys():
            cost = cost + activity[i]['soft'][1]*abs(result[i] % 24 - csp.activities[i]['soft'][0])
    print("cost:"+str(cost), end="")
else:
    print("No solution", end="")
    sys.exit(1)

