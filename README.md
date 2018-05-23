# emitation

## fo
fo is a auto generator executor,
- `Fo(p1, p2, p3, ...)`，constructor of `Fo`, can pass multiple args in it.
- `Fo.prototype.run(g1, g2, ...)`，used to execute multiple generator at a time, the order is the round-robin
- `Fo.prototype.delay(time)`，used to delay execute, the unit is ms.
- `Fo.prototype.transfer()`，transfer control to next generator, must be used in generator
