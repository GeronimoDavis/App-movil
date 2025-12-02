
import Habit from '../models/habitModel.js';


export const createHabit = async (req, res) => {
    try{
        const {name, description, daysTarget} = req.body;
        const userId = req.user._id;

        const newHabit = new Habit({
            name,
            description,
            daysTarget,
            startdate: Date.now(),
            startdatestreak: Date.now(),
            asset: true,
            user: userId
        })
        await newHabit.save();
        res.status(201).json({ habit: newHabit, message: "Habit created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message, error: "Error creating habit" });
    }
       
};

export const getHabitsWithStreak = async (req, res) => {
    try{
        //tremos del req el id del usuario para buscar solo los habitos de ese usaurio
        const userId = req.user._id
        const habits = await Habit.find({user: userId});
        
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

export const getHabitwithStreakById = async (req, res) => {
    try{
        const {id} = req.params;
        const userId = req.user._id;
        const habit = await Habit.findById({_id: id, user: userId});
        if(!habit){
            return res.status(404).json({ message: "Habit not found", error: "Habit not found" });
        }

        const now = new Date();
        const StreakMs =  now - habit.startdatestreak;
        const days = Math.floor(StreakMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((StreakMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((StreakMs % (1000 * 60 * 60)) / (1000 * 60));

        return res.status(200).json({ habit: {...habit._doc,
            currentStreak: {
                days, 
                hours,
                minutes
        }}, message: "Habit retrieved successfully" });
    }catch (error) {
        res.status(500).json({ message: error.message, error: "Error retrieving habit" });
    }
}

export const getBestStreak = async (req, res) => {
    try{
        const {id} = req.params;
        const userId = req.user.id;

        const habit = await Habit.findById({ _id: id, user: userId });
        if(!habit){
            return res.status(404).json({ message: "Habit not found", error: "Habit not found" });
        }

        const bestStreakMs = habit.beststreak;
        const days = Math.floor(bestStreakMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((bestStreakMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((bestStreakMs % (1000 * 60 * 60)) / (1000 * 60));

        return res.status(200).json({ bestStreak: {
            days,
            hours,
            minutes
        }});
    }catch (error) {
        res.status(500).json({ message: error.message, error: "Error retrieving best streak" });
    }
}


export const lostStreak = async (req, res) => {
    try{
        const {id} = req.params;
        const userId = req.user.id;

        const habit = await Habit.findById({ _id: id, user: userId });
        if(!habit){
            return res.status(404).json({ message: "Habit not found", error: "Habit not found" });
        }

        const now = new Date();
        const currentStreakMs =  now - habit.startdatestreak;
        
        if(currentStreakMs > habit.beststreak){
            habit.beststreak = currentStreakMs;
        }

        habit.startdatestreak = now;
        habit.lastLossdate = now;

        await habit.save();
        res.status(200).json({ habit, message: "Reset streak successfully" });
    }catch (error) {
        res.status(500).json({ message: error.message, error: "Error updating habit streak" });
    }
};

export const deleteHabit = async (req, res) => {
    try{
        const {id} = req.params;
        const habit = await Habit.findByIdAndDelete(id);
        if(!habit){
            return res.status(404).json({ message: "Habit not found", error: "Habit not found" });
        }
        res.status(200).json({ message: "Habit deleted successfully" });
    }catch (error) {
        res.status(500).json({ message: error.message, error: "Error deleting habit" });
    }
}


