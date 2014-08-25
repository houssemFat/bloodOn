# Pyplot is a module within the matplotlib library for plotting
import matplotlib.pyplot as plt

def build(data):
    for i in data:
        ys = []
        xs = []
        for j in i:
            ys.append(j[1])
            xs.append(j[0])
        plt.plot(ys, xs)
    plt.savefig('bloodon/tools/result.png')
    #plt.close()
    return  'success'
#w, h = 370, 170
#matrix = numpy.zeros((w, h, 3), dtype=numpy.uint8



