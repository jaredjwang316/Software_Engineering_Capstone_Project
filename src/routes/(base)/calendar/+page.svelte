<script lang="ts">
    export let data;

    import Calendar from '$lib/components/CalendarComponent.svelte';
	import {createEventDispatcher, onMount} from 'svelte';

	var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	let headers = [];
	let now = new Date();
	let year = now.getFullYear();		//	this is the month & year displayed
	let month = now.getMonth();
	let items = [];

	var days = [];	//	The days to display in each box

	function randInt(max) {
		return Math.floor(Math.random()*max)+1;
	}
	
	//	The Calendar Component just displays stuff in a row & column. It has no knowledge of dates.
	//	The items[] below are placed (by you) in a specified row & column of the calendar.
	//	You need to call findRowCol() to calc the row/col based on each items start date. Each date box has a Date() property.
	//	And, if an item overlaps rows, then you need to add a 2nd item on the subsequent row.
	// var items = [];


	function initMonthItemsFromData() {
		items = [];
		
		for (const course of data.courses) {
			if (!course.assignments || course.assignments.length === 0) continue;

			for (const assignment of course.assignments) {
				if (!assignment.due_date) continue;

				const date = new Date(assignment.due_date);
				const rc = findRowCol(date);

				if (!rc) {
					console.warn('Could not locate calendar position for', date);
					continue;
				}

				items.push({
					title: assignment.assignment_name || "Untitled Assignment",
					className: "task--primary",
					date,
					len: 1,
					href: `/${course.course_id}/assignment/${assignment.assignment_id}/` + (assignment.student_assignment_id ?? ''),
					startCol: rc.col,
					startRow: rc.row
				});
			}
		}
	}

	$: month, year, initContent();

	// choose what date/day gets displayed in each date box.
	function initContent() {
		headers = dayNames;
		initMonth();
		initMonthItemsFromData();
	}

	function initMonth() {
		days = [];
		let monthAbbrev = monthNames[month].slice(0,3);
		let nextMonthAbbrev = monthNames[(month+1)%12].slice(0,3);
		//	find the last Monday of the previous month
		var firstDay = new Date(year, month, 1).getDay();
		//console.log('fd='+firstDay+' '+dayNames[firstDay]);
		var daysInThisMonth = new Date(year, month+1, 0).getDate();
		var daysInLastMonth = new Date(year, month, 0).getDate();
		var prevMonth = month==0 ? 11 : month-1;
		
		//	show the days before the start of this month (disabled) - always less than 7
		for (let i=daysInLastMonth-firstDay;i<daysInLastMonth;i++) {
			let d = new Date(prevMonth==11?year-1:year,prevMonth,i+1);
			days.push({name:''+(i+1),enabled:false,date:d,});
		}
		//	show the days in this month (enabled) - always 28 - 31
		for (let i=0;i<daysInThisMonth;i++) {
			let d = new Date(year,month,i+1);
			if (i==0) days.push({name:monthAbbrev+' '+(i+1),enabled:true,date:d,});
			else days.push({name:''+(i+1),enabled:true,date:d,});
			//console.log('i='+i+'  dt is '+d+' date() is '+d.getDate());
		}
		//	show any days to fill up the last row (disabled) - always less than 7
		for (let i=0;days.length%7;i++) {
			let d = new Date((month==11?year+1:year),(month+1)%12,i+1);
			if (i==0) days.push({name:nextMonthAbbrev+' '+(i+1),enabled:false,date:d,});
			else days.push({name:''+(i+1),enabled:false,date:d,});
		}
	}

	function findRowCol(dt) {
		for (let i=0;i<days.length;i++) {
			let d = days[i].date;
			if (d.getYear() === dt.getYear()
				&& d.getMonth() === dt.getMonth()
				&& d.getDate() === dt.getDate())
				return {row:Math.floor(i/7)+2,col:i%7+1};
		}
		return null;	
	}

	function itemClick(e) {
		eventText='itemClick '+JSON.stringify(e) + ' localtime='+e.date.toString();
	}
	function dayClick(e) {
		eventText='onDayClick '+JSON.stringify(e) + ' localtime='+e.date.toString();
	}
	function headerClick(e) {
		eventText='onHheaderClick '+JSON.stringify(e);
	}
	function next() {
		month++;
		if (month == 12) {
			year++;
			month=0;
		}
	}
	function prev() {
		if (month==0) {
			month=11;
			year--;
		} else {
			month--;
		}
	}
	
</script>

<style>
	.calendar-container {
		width: 100%;
		overflow: hidden;
		box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
		border-radius: 10px;
		background: #fff;
		max-width: 1200px;
  }
  .calendar-header {
		text-align: center;
		padding: 20px 0;
		background: #eef;
		border-bottom: 1px solid rgba(166, 168, 179, 0.12);
  }
  .calendar-header button {
		background: #eef;
		border: 1px ;
		padding: 6;
		color: rgba(81, 86, 93, 0.7);
		cursor: pointer;
		outline: 0;
  }
</style>

<div class="flex-1 flex justify-center">
<div class="calendar-container">
  <div class="calendar-header flex justify-center">
    <div class="w-1/4 flex justify-between items-center text-3xl">
    <div>
      <button on:click={()=>year--}>&Lt;</button>
      <button on:click={()=>prev()}>&lt;</button>
    </div>
    <h2 class="text-xl">
      {monthNames[month]} {year}
    </h2>
    <div>
      <button on:click={()=>next()}>&gt;</button>
      <button on:click={()=>year++}>&Gt;</button>
    </div>
    </div>
	</div>

	<Calendar
		{headers}
		{days}
		{items}
		/>
</div>
</div>
