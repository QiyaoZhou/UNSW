from cspConsistency import Search_with_AC_from_CSP
from cspProblem import Variable, CSP, Constraint
from searchGeneric import AStarSearcher


class ExtendedCSP(CSP):
    def __init__(self, variables, constraints, soft_constraints):
        self.variables = variables
        self.constraints = constraints
        self.var_to_const = {var: set() for var in self.variables}
        for con in constraints:
            for var in con.scope:
                self.var_to_const[var].add(con)
        self.soft_constraints = soft_constraints


class Search_with_AC_from_cost_CSP(Search_with_AC_from_CSP):
    """A search problem with arc consistency and domain splitting

        A node is a CSP """
    def __init__(self, csp):
        super().__init__(csp)

    '''def heuristic(self,node):
        s = self.cons.csp.soft_constraints
        for s_item in s:
            if node == s_item[0]:
                h ='''


def information_access(filename):
    activity = []
    duration = []
    a_detail = {}
    soft = []
    day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    time = ['7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm']
    domain0 = []
    for i in day:
        for j in time:
            domain0.append(i+' '+j)
    domain = {}
    constraints = []

    def before(x, y):
        return domain0.index(x[1]) <= domain0.index(y[0])

    def after(x, y):
        return domain0.index(x[0]) >= domain0.index(y[1])

    def starts(x, y):
        return domain0.index(x[0]) == domain0.index(y[0])

    def ends(x, y):
        return domain0.index(x[1]) == domain0.index(y[1])

    def overlaps(x, y):
        return domain0.index(x[0]) < domain0.index(y[0]) and domain0.index(x[1]) < domain0.index(y[1])

    def during(x, y):
        return domain0.index(x[0]) > domain0.index(y[0]) and domain0.index(x[1]) < domain0.index(y[1])

    def equals(x, y):
        return domain0.index(x[0]) == domain0.index(y[0]) and domain0.index(x[1]) == domain0.index(y[1])

    def same_day(x, y):
        return x[0].split(' ')[0] == y[0].split(' ')[0]

    with open(filename) as f1:
        for line in f1:
            line = line.strip('\n')
            content = line.split(' ')
            if content[0] == '#':
                continue
            elif content[0] == 'activity':
                activity.append(content[1])
                duration.append(int(content[2]))
                a_detail[content[1]] = int(content[2])
            elif content[0] == 'domain' and len(content) == 5:
                soft.append([content[1], content[3], int(content[4])])
    f1.close()
    for i in activity:
        domain[i] = ['sun 7am', 'sun 8am', 'sun 9am', 'sun 10am', 'sun 11am', 'sun 12pm', 'sun 1pm', 'sun 2pm', 'sun 3pm', 'sun 4pm', 'sun 5pm', 'sun 6pm', 'sun 7pm', 'mon 7am', 'mon 8am', 'mon 9am', 'mon 10am', 'mon 11am', 'mon 12pm', 'mon 1pm', 'mon 2pm', 'mon 3pm', 'mon 4pm', 'mon 5pm', 'mon 6pm', 'mon 7pm', 'tue 7am', 'tue 8am', 'tue 9am', 'tue 10am', 'tue 11am', 'tue 12pm', 'tue 1pm', 'tue 2pm', 'tue 3pm', 'tue 4pm', 'tue 5pm', 'tue 6pm', 'tue 7pm', 'wed 7am', 'wed 8am', 'wed 9am', 'wed 10am', 'wed 11am', 'wed 12pm', 'wed 1pm', 'wed 2pm', 'wed 3pm', 'wed 4pm', 'wed 5pm', 'wed 6pm', 'wed 7pm', 'thu 7am', 'thu 8am', 'thu 9am', 'thu 10am', 'thu 11am', 'thu 12pm', 'thu 1pm', 'thu 2pm', 'thu 3pm', 'thu 4pm', 'thu 5pm', 'thu 6pm', 'thu 7pm', 'fri 7am', 'fri 8am', 'fri 9am', 'fri 10am', 'fri 11am', 'fri 12pm', 'fri 1pm', 'fri 2pm', 'fri 3pm', 'fri 4pm', 'fri 5pm', 'fri 6pm', 'fri 7pm', 'sat 7am', 'sat 8am', 'sat 9am', 'sat 10am', 'sat 11am', 'sat 12pm', 'sat 1pm', 'sat 2pm', 'sat 3pm', 'sat 4pm', 'sat 5pm', 'sat 6pm', 'sat 7pm']
    for j in activity:
        check = 0
        for k in soft:
            if k[0] == j:
                check = 1
        if check == 0:
            soft.append([j, 'sun 7am', 0])
    with open(filename) as f2:
        for line in f2:
            line = line.strip('\n')
            content = line.split(' ')
            if content[0] == 'domain' and len(content) == 4:
                if content[2] == 'on':
                    b = domain[content[1]]
                    for a in domain[content[1]].copy():
                        if a.split(' ')[0] != content[3]:
                            b.remove(a)
                    domain[content[1]] = b
                if content[2] == 'before':
                    b = domain[content[1]]
                    for a in domain[content[1]].copy():
                        if day.index(a.split(' ')[0]) > day.index(content[3]):
                            b.remove(a)
                    domain[content[1]] = b
                if content[2] == 'after':
                    b = domain[content[1]]
                    for a in domain[content[1]].copy():
                        if day.index(a.split(' ')[0]) < day.index(content[3]):
                            b.remove(a)
                    domain[content[1]] = b
                if content[2] == 'starts-before':
                    b = domain[content[1]]
                    for a in domain[content[1]].copy():
                        if time.index(a.split(' ')[1]) > time.index(content[3]):
                            b.remove(a)
                    domain[content[1]] = b
                if content[2] == 'starts-after':
                    b = domain[content[1]]
                    for a in domain[content[1]].copy():
                        if time.index(a.split(' ')[1]) < time.index(content[3]):
                            b.remove(a)
                    domain[content[1]] = b
                if content[2] == 'ends-before':
                    b = domain[content[1]]
                    for a in domain[content[1]].copy():
                        if time.index(a.split(' ')[1]) > time.index(content[3])-a_detail[content[1]]:
                            b.remove(a)
                    domain[content[1]] = b
                if content[2] == 'ends-after':
                    b = domain[content[1]]
                    for a in domain[content[1]].copy():
                        if time.index(a.split(' ')[1]) < time.index(content[3])-a_detail[content[1]]:
                            b.remove(a)
                    domain[content[1]] = b
            if content[0] == 'constraint' and len(content) == 4:
                if content[2] == 'before':
                    constraints.append([[content[1], content[3]], before])
                elif content[2] == 'after':
                    constraints.append([[content[1], content[3]], after])
                elif content[2] == 'starts':
                    constraints.append([[content[1], content[3]], starts])
                elif content[2] == 'ends':
                    constraints.append([[content[1], content[3]], ends])
                elif content[2] == 'overlaps':
                    constraints.append([[content[1], content[3]], overlaps])
                elif content[2] == 'during':
                    constraints.append([[content[1], content[3]], during])
                elif content[2] == 'equals':
                    constraints.append([[content[1], content[3]], equals])
                elif content[2] == 'same-day':
                    constraints.append([[content[1], content[3]], same_day])
    f2.close()
    for i in activity:
        j = domain[i]
        res = []
        for k in j:
            if domain0.index(k) + a_detail[i] <= domain0.index('sat 7pm'):
                if domain0[domain0.index(k) + a_detail[i]].split(' ')[0] == k.split(' ')[0]:
                    res.append([k, domain0[domain0.index(k) + a_detail[i]]])
        domain[i] = res
    print(domain)
# domain_real = {i:[j[0] for j in domain[i]] for i in domain.keys()}
    v = []
    for i in domain.keys():
        v.append(Variable(i, domain[i]))
    print(v)
    c = []
    for j in constraints:
        for k in v:
            if k.name == j[0][0]:
                v0 = k
            if k.name == j[0][1]:
                v1 = k
        c.append(Constraint([v0, v1], j[1]))
    csp = ExtendedCSP(variables=set(v), constraints=c, soft_constraints=soft)
    my_searcher = AStarSearcher(Search_with_AC_from_cost_CSP(csp))
    solution = my_searcher.search()
    print(solution)
    if solution:
        print({v: d for (v, d) in solution.end().items()})


information_access('D:/UNSW/2022-T2/9414/assignment/assignment1/input1.txt')
