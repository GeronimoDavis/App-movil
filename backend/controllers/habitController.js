
import Habit from '../models/habitModel.js';


export const createHabit = async (req, res) => {
    try{
        const {name, description, daysTarget} = req.body;

        const newHabit = new Habit({
            name,
            description,
            daysTarget,
            startdate: Date.now(),
            startdatestreak: Date.now(),
            asset: true
        })
        await newHabit.save();
        res.status(201).json({ habit: newHabit, message: "Habit created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message, error: "Error creating habit" });
    }
       
};

export const getHabitsWithStreak = async (req, res) => {
    try{
        const habits = await Habit.find();
        
        //calculo de la racha actual ya que esta no se guarda en la base de datos sino que se calcula al momento de pedir los habitos
        const habitsWithStreak = habits.map(habit => {
            const now = new Date();
            const StreakMs =  now - habit.startdatestreak;

            const days = Math.floor(StreakMs / (1000 * 60 * 60 * 24));//1000 * 60 * 60 * 24 = un dia en ms (86400000 ms) aca obtengo los dias de racha y descarto las horas y minutos
            const hours = Math.floor((StreakMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));// aca obtengo las horas restantes despues de sacar los dias
            const minutes = Math.floor((StreakMs % (1000 * 60 * 60)) / (1000 * 60));// aca obtengo los minutos restantes despues de sacar las horas
            return{
                ...habit._doc,// extraemos los datos del habit tal como estan en la base de datos
                currentStreak: {
                    days,
                    hours,
                    minutes
                }
            }
        });

        res.status(200).json({ habits: habitsWithStreak, message: "Habits retrieved successfully" });

        
    }catch (error) {
        res.status(500).json({ message: error.message, error: "Error retrieving habits" });
    }
};
